function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/[^\w\-\*\$]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { slugify }