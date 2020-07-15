import fs from 'fs';

export default async function writeFile(/** @type {string} */ path, /** @type {string} */ content) {
  await fs.promises.writeFile(path, content, { encoding: 'utf-8' });
}
