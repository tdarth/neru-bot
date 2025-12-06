const fs = require("fs").promises;
const { cleanForMatch } = require('./cleanForMatch');

async function cleanVoteData(json, songFile) {
    const warnings = [];
    const data = json;

    const content = await fs.readFile(songFile, "utf-8");
    const songJson = JSON.parse(content);

    const validSongNames = new Set(
        songJson.songs.map(entry => cleanForMatch(entry.song.name))
    );

    data.users.forEach(user => {
        const seen = new Map();
        const uniqueVotes = [];

        for (const vote of user.votes) {
            if (!validSongNames.has(vote.song)) {
                warnings.push(`${user.username} (${user.id}) had a vote for unknown song: ${vote.song}`);
                continue;
            }

            if (!seen.has(vote.song)) {
                seen.set(vote.song, vote.vote);
                uniqueVotes.push(vote);
            } else {
                const firstScore = seen.get(vote.song);
                if (firstScore !== vote.vote) {
                    warnings.push(
                        `${user.username} (${user.id}) had duplicate scores for ${vote.song}: ` +
                        `${firstScore} and ${vote.vote}.`
                    );
                }
            }
        }

        user.votes = uniqueVotes;
    });

    return { data, warnings };
}

module.exports = { cleanVoteData };