import fs from 'fs';

export default async function makeDirectoryIfNotExists(/** @type {string} */ path) {
  try {
    await fs.promises.mkdir(path);
  }
  catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}
