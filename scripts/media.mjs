import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const imagePattern = /\.(jpe?g|png|webp|avif)$/i;
async function imagesIn(folder) {
  try {
    return (await readdir(folder, { withFileTypes: true }))
      .filter(entry => entry.isFile() && imagePattern.test(entry.name))
      .map(entry => entry.name).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
const imageURL = (...parts) => '/' + parts.flatMap(part => part.split('/')).map(encodeURIComponent).join('/');
export async function buildMedia(root) {
  const definitions = JSON.parse(await readFile(path.join(root, 'content/albums.json'), 'utf8'));
  const base = path.join(root, 'public/images');
  const albums = {};
  for (const [id, album] of Object.entries(definitions)) {
    const folder = path.resolve(base, album.folder);
    if (!folder.startsWith(base + path.sep)) throw new Error('Invalid photo album folder: ' + id);
    const files = await imagesIn(folder);
    let captions = {};
    try { captions = JSON.parse(await readFile(path.join(folder, 'captions.json'), 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw new Error('Check captions.json in ' + album.folder + ': ' + error.message); }
    albums[id] = files.map((file, index) => {
      const caption = typeof captions[file] === 'string' ? captions[file].trim() : '';
      return { src: imageURL('images', album.folder, file), alt: caption || album.title + ' — photo ' + (index + 1), caption };
    });
  }
  const profiles = await imagesIn(path.join(base, 'profile'));
  const portrait = profiles.find(file => /^portrait\./i.test(file)) || profiles[0];
  return { portrait: portrait ? { src: imageURL('images/profile', portrait), alt: 'Omar Bouattour' } : null, albums };
}
