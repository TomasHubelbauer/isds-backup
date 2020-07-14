import fs from 'fs';

export default async function readTextFileIfExists(/** @type {string} */ path) {
  let text;
  try {
    text = await fs.promises.readFile(path, { encoding: 'utf-8' });
  }
  catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return text;
}
