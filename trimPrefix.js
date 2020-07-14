export default function trimPrefix(/** @type {string} */ string, /** @type {string} */ prefix) {
  if (string.startsWith(prefix)) {
    return string.slice(prefix.length);
  }

  return string;
}
