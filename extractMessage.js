export default function extractMessage(/** @type {HTMLDivElement} */ div) {
  function trimPrefix(/** @type {string} */ string, /** @type {string} */ prefix) {
    if (string.startsWith(prefix)) {
      return string.slice(prefix.length);
    }

    return string;
  }

  const sender = trimPrefix(div.querySelector('.messages-list__item-left__databox').textContent.trim(), 'Jméno:').trim();
  const subject = trimPrefix(div.querySelector('.messages-list__item-left__subject').textContent.trim(), 'Předmět:').trim();
  const stamp = trimPrefix(div.querySelector('.messages-list__item-right__datetime').textContent.trim(), 'Doručeno,').trim();
  const id = trimPrefix(div.querySelector('.messages-list__item-right__note').textContent.trim(), 'ID:').trim();
  return { sender, subject, stamp, id };
}
