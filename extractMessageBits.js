export default function deriveMessageBits(/** @type {HTMLDivElement} */ div) {
  return {
    sender: div.querySelector('.messages-list__item-left__databox').textContent,
    subject: div.querySelector('.messages-list__item-left__subject').textContent,
    stamp: div.querySelector('.messages-list__item-right__datetime').textContent,
    id: div.querySelector('.messages-list__item-right__note').textContent,
  }
}
