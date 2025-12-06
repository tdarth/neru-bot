function cleanVoteData(json) {
    const warnings = [];
    const data = json;

    data.users.forEach(user => {
        const seen = new Map();
        const uniqueVotes = [];

        for (const vote of user.votes) {
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
    });

    return { data, warnings };
}

module.exports = { cleanVoteData };