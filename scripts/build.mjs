import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildMedia } from './media.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const media = await buildMedia(root);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'src'), output, { recursive: true });
await cp(path.join(root, 'public'), output, { recursive: true, filter: source => !source.endsWith('captions.json') });
await cp(path.join(root, 'LICENSE'), path.join(output, 'LICENSE'));
await writeFile(path.join(output, 'media.json'), JSON.stringify(media, null, 2) + '\n');
console.log('Built static portfolio in dist/ — ' + Object.values(media.albums).reduce((n, photos) => n + photos.length, 0) + ' album photos');
