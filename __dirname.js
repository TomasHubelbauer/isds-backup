import path from 'path';
import url from 'url';

export default path.dirname(url.fileURLToPath(import.meta.url));
