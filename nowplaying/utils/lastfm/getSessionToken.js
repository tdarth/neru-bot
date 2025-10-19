const { getUserData } = require('./getUserData');

const cache = {};

async function getSessionToken(id) {
    if (cache[id]) {
        if (await getUserData(cache[id])) {
            return cache[id];
        } else {
            delete cache[id];
        }
    }

    const response = await fetch(`${process.env.NP_API_URL}session`, {
        method: "POST",
        headers: {
            "x-api-key": process.env.NP_API_KEY,
        },
        body: JSON.stringify({
            "type": "get",
            "discord_id": id
        })
    });

    if (response.status == 470) return false;
    if (!response.ok) return false;

    const data = await response.json();
    const session = data.session || null;

    if (!session) return false;

    if (await getUserData(session)) {
        cache[id] = session;
        return session;
    }
    else return false;
}

module.exports = { getSessionToken };