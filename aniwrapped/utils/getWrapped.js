const { getDataCache, setDataCache } = require('../utils/dataCache');
const { getId, cacheId } = require('../utils/getAnilistToken');

const query = `query {
  MediaListCollection(
    userId: 0
    type: ANIME
  ) {
    lists {
      name
      entries {
        status
        score
        progress
        repeat
        updatedAt
        startedAt { year month day }
        completedAt { year month day }
        media {
          id
          idMal
          title {
            userPreferred
            romaji
            english
          }
          format
          episodes
          season
          seasonYear
          status
          averageScore
          genres
          isAdult
          coverImage {
            medium
            large
            extraLarge
          }
          siteUrl
          duration
          isFavourite
          studios {
            nodes {
              name
              isAnimationStudio
            }
          },
          bannerImage
        }
        notes
      }
    }
  }
}`

function inYear(anime, year) {
  return (anime?.completedAt?.year == year || anime?.startedAt?.year == year) ? true : false;
}

async function getWrapped(token, userId, wrappedYear) {
  try {
    let aniUserId = getId(userId) || null;

    if (!aniUserId) {
      const idRes = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `query { Viewer { id } }`,
        }),
      });

      if (!idRes.ok) return 'cannotgetid_error';
      const idData = await idRes.json();
      aniUserId = idData?.data?.Viewer?.id;
      cacheId(userId, aniUserId);
    }

    const checkRes = await fetch(`${process.env.WRAPPED_API_URL}?key=${userId}`);

    if (checkRes.ok) {
      const checkData = await checkRes.json();
      const dataYear = checkData?.data?.year;
      if (checkRes.status == 200 && dataYear == wrappedYear) return `${process.env.WRAPPED_FRONTEND_URL}view?id=${userId}`;
    }

    let data = {};
    let wrapped = {
      "year": 0,
      "timeWatched": {
        total: 0,
        breakdown: []
      },
      "genres": {
        total: 0,
        top: [],
        breakdown: []
      },
      "watchingAge": {
        age: 0,
        fromYear: 0,
        breakdown: []
      },
      "animeCount": {
        total: 0,
        firstWatched: {},
        guesses: [],
        breakdown: []
      },
      "favorites": {
        total: 0,
        breakdown: []
      },
      "studios": {
        total: 0,
        top: [],
        topOne: {},
        guesses: [],
        breakdown: []
      }
    };
    const cache = getDataCache(token);

    if (cache) data = cache
    else {
      const response = await fetch(`https://graphql.anilist.co`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query }).replace('userId: 0', `userId: ${aniUserId}`)
      });

      if (!response.ok) return 'unknown_error';
      if (data.errors) {
        console.error(data.errors);
        return 'graphql_error';
      }

      data = await response.json();
      setDataCache(token, data);
    }

    const completedAnime = data?.data?.MediaListCollection?.lists?.[0]?.entries || null;
    if (!completedAnime) return 'noanimefound_error';

    let totalMinsWatched = 0;
    let genreData = new Map();
    let yearsData = [];
    let animeWatched = 0;
    let animeMediaData = [];
    let firstAnime = {};
    let totalFavorites = 0;
    let favoriteData = [];
    let studioData = new Map();

    wrapped['year'] = wrappedYear;

    // time watched
    for (const anime of completedAnime) {
      if (!inYear(anime, wrappedYear)) continue;
      const duration = anime?.media?.duration;

      if (!duration) continue;

      const minsWatched = duration * anime?.progress;
      totalMinsWatched += minsWatched;
      wrapped['timeWatched']['breakdown'].push({ title: anime?.media?.title, minsWatched });
    }
    wrapped['timeWatched']['total'] = totalMinsWatched;
    // time watched

    // genres
    for (const anime of completedAnime) {
      if (!inYear(anime, wrappedYear)) continue;
      const genres = anime?.media?.genres;

      if (!genres || genres.length <= 0) continue;

      for (const genre of genres) {
        const data = genreData.get(genre) || 0;
        genreData.set(genre, data + 1);
      }
    }
    genreData = new Map([...genreData.entries()].sort((a, b) => b[1] - a[1]));
    wrapped['genres']['total'] = genreData.size;
    wrapped['genres']['top'] = Object.fromEntries(Array.from(genreData).slice(0, 5));
    wrapped['genres']['breakdown'] = Object.fromEntries(genreData);
    // genres

    // watching age
    for (const anime of completedAnime) {
      if (!inYear(anime, wrappedYear)) continue;
      const year = anime?.media?.seasonYear;

      if (!year) continue;

      yearsData.push(year);
    }
    if (yearsData.length <= 0) return 'nodatainyear_error'
    const avgYear = Math.round(yearsData.reduce((a, b) => Number(a) + Number(b)) / yearsData.length);
    wrapped['watchingAge']['age'] = wrappedYear - avgYear;
    wrapped['watchingAge']['fromYear'] = avgYear;
    wrapped['watchingAge']['breakdown'] = yearsData;
    // watching age

    // animes watched and first watched
    for (const anime of completedAnime) {
      if (!inYear(anime, wrappedYear)) continue;

      animeWatched++;
      animeMediaData.push(anime);
    }

    for (const anime of completedAnime) {
      if (!inYear(anime, wrappedYear)) continue;
      firstAnime = anime;
      break;
    }
    wrapped['animeCount']['total'] = animeWatched;
    wrapped['animeCount']['firstWatched'] = firstAnime;
    wrapped['animeCount']['guesses'] = [...animeMediaData.filter(anime => anime !== firstAnime)].sort(() => 0.5 - Math.random()).slice(0, 4);
    // animes watched and first watched

    // favorites
    for (const anime of completedAnime) {
      if (!inYear(anime, wrappedYear)) continue;
      const isFavorite = anime?.media?.isFavourite;

      if (!isFavorite) continue;
      totalFavorites++;
      favoriteData.push(anime);
    }
    favoriteData.sort((a, b) => b.score - a.score);
    wrapped['favorites']['total'] = totalFavorites;
    wrapped['favorites']['breakdown'] = favoriteData;
    // favorites

    // studios
    for (const anime of completedAnime) {
      if (!inYear(anime, wrappedYear)) continue;
      const studios = anime?.media?.studios?.nodes;

      if (!studios || studios.length <= 0) continue;

      for (const studio of studios) {
        if (!studio?.isAnimationStudio) continue;
        const data = studioData.get(studio.name) || 0;
        studioData.set(studio.name, data + 1);
      }
    }
    studioData = new Map([...studioData.entries()].sort((a, b) => b[1] - a[1]));
    const studiosArray = [...studioData.entries()];
    const topOneStudio = studiosArray[0];
    wrapped['studios']['total'] = studioData.size;
    wrapped['studios']['top'] = Object.fromEntries(Array.from(studioData).slice(0, 5));
    wrapped['studios']['topOne'] = { name: topOneStudio[0], count: topOneStudio[1] };
    wrapped['studios']['guesses'] = studiosArray.slice(1).sort(() => 0.5 - Math.random()).slice(0, 4);
    wrapped['studios']['breakdown'] = Object.fromEntries(studioData);
    // studios

    const wrapURL = new URL(process.env.WRAPPED_API_URL);
    wrapURL.searchParams.set('key', `${userId}`);
    wrapURL.searchParams.set('ttl', 1209600); // 14 days expire time

    const storeRes = await fetch(wrapURL.toString(), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.WRAPPED_API_SECRET}`,
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ data: wrapped })
    });

    if (!storeRes.ok) return 'save_error';
    console.log(JSON.stringify(wrapped))
    return `${process.env.WRAPPED_FRONTEND_URL}view?id=${userId}`;
  } catch (e) {
    console.log(e);
  }

}

module.exports = { getWrapped };