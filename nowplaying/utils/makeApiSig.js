const crypto = require('crypto');

function makeApiSig(params) {
  const keys = Object.keys(params).sort();
  const str = keys.map(k => `${k}${params[k]}`).join('') + process.env.LAST_FM_SHARED_SECRET;
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

module.exports = { makeApiSig }