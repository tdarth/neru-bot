const fs = require('fs');
const path = require('path');
const cachePath = path.join(__dirname, '../tokenCache.json');
const cachePath2 = path.join(__dirname, '../idCache.json');

let { userAnilistTokens } = require(cachePath);
let { userIds } = require(cachePath2);

async function validateAnilistToken(token, userid) {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `query { Viewer { id } }`,
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    if (!getId(userid)) cacheId(userid, data?.data?.Viewer?.id);

    return true;
  } catch (error) {
    return false;
  }
}

async function getAnilistToken(userid) {
  const cached = userAnilistTokens[userid]?.token;
  if (cached) {
    const isValid = await validateAnilistToken(cached, userid);
    if (isValid) return cached;
  }

  const response = await fetch(`${process.env.TOKEN_API_URL}?id=${userid}`, {
    headers: {
      'Authorization': `Bearer ${process.env.KV_API_SECRET}`
    }
  });

  if (!response.ok) {
    if (response.statusText === "Not Found") return 'user_not_linked';
    return `Error: ${response.status} ${response.statusText}`;
  }

  const token = await response.text();

  const isValid = await validateAnilistToken(token, userid);
  if (!isValid) return 'user_token_expire';

  userAnilistTokens[userid] = { token };
  fs.writeFileSync(cachePath, JSON.stringify({ userAnilistTokens }, null, 2));
  return token;
}

function getId(userid) {
  const cached = userIds?.[userid]?.id;
  if (cached) return cached;
  return false;
}

function cacheId(userid, id) {
  userIds[userid] = { id }
  fs.writeFileSync(cachePath2, JSON.stringify({ userIds }, null, 2));
}

module.exports = { getAnilistToken, getId, cacheId };