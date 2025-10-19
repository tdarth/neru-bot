const cache = {};

async function getAdditionalSongInfo(track_mbid, artist_mbid) {
    const cacheKey = `${track_mbid}-${artist_mbid}`;

    if (cache[cacheKey]) return cache[cacheKey];

    const fullData = {};

    let data;
    const response = await fetch(`${process.env.MUSICBRAINZ_API_URL}artist/${artist_mbid}?inc=url-rels&fmt=json`, {
        headers: {
            "User-Agent": "nowplaying/1.0 ( https://github.com/tdarth/neru-bot )"
        }
    });

    if (response.ok) data = await response.json();

    let data2;
    const response2 = await fetch(`${process.env.COVERARTARCHIVE_API_URL}/release/${track_mbid}`, {
        headers: {
            "User-Agent": "nowplaying/1.0 ( https://github.com/tdarth/neru-bot )"
        }
    });

    if (response2.ok) data2 = await response2.json();

    if (data) fullData.artist = data;
    if (data2) fullData.cover = data2;

    const result = Object.keys(fullData).length ? fullData : false;

    cache[cacheKey] = result;

    return result;
}

module.exports = { getAdditionalSongInfo };