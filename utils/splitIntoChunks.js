function splitIntoChunks(str, maxLength) {
  const chunks = [];
  let start = 0;

  while (start < str.length) {
    let end = start + maxLength;
    if (end >= str.length) {
      chunks.push(str.slice(start));
      break;
    }

    let lastNewline = str.lastIndexOf('\n', end);
    if (lastNewline > start) {
      end = lastNewline + 1;
    }

    chunks.push(str.slice(start, end));
    start = end;
  }

  return chunks;
}

module.exports

module.exports = splitIntoChunks;
