export default function extractBox(/** @type {HTMLDivElement} */ div) {
  const userId = div.querySelector('a[title="ID uživatele"]').textContent.trim();
  const name = div.querySelector('strong:nth-of-type(1)').textContent.trim();
  const type = div.querySelector('strong:nth-of-type(2)').textContent.trim();
  const id = div.querySelector('strong:nth-of-type(3)').textContent.trim();
  const userName = div.querySelector('strong:nth-of-type(4)').textContent.trim();
  const userType = div.querySelector('strong:nth-of-type(5)').textContent.trim();
  return { name, type, id, user: { name: userName, type: userType, id: userId } };
}
