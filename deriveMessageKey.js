import trimPrefix from './trimPrefix.js';

export default function deriveMessageKey(/** @type {{ sender: string; subject: string; stamp: string; id: string; }} */ bits) {
  return JSON.stringify({
    sender: trimPrefix(bits.sender, 'Jméno:').trim(),
    subject: trimPrefix(bits.subject, 'Předmět:').trim(),
    stamp: trimPrefix(bits.stamp, 'Doručeno,').trim(),
    id: trimPrefix(bits.id, 'ID:').trim(),
  })
}
