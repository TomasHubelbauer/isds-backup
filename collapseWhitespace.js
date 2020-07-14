export default function collapseWhitespace(/** @type {string} */ string) {
  return string.replace(/(\n|\s+)/g, ' ');
}
