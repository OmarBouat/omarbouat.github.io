import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { respond } from '../scripts/serve.mjs';
import { buildMedia } from '../scripts/media.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'src/index.html'), 'utf8');
const script = await readFile(path.join(root, 'src/main.js'), 'utf8');
const themeScript = await readFile(path.join(root, 'src/theme.js'), 'utf8');
const flush = () => new Promise(setImmediate);

function setup(options = {}) {
  const { document, Event } = parseHTML(html);
  const values = new Map(options.savedTheme ? [['omar-portfolio-theme', options.savedTheme]] : []);
  const storage = {
    getItem: key => { if (options.blockStorage) throw new Error('Storage blocked'); return values.get(key); },
    setItem: (key, value) => { if (options.blockStorage) throw new Error('Storage blocked'); values.set(key, value); }
  };
  vm.runInNewContext(themeScript, { document, localStorage: storage });
  const dialog = document.querySelector('dialog');
  dialog.showModal = () => dialog.setAttribute('open', '');
  dialog.close = () => { dialog.removeAttribute('open'); dialog.dispatchEvent(new Event('close')); };
  let focused;
  document.querySelectorAll('button').forEach(button => { button.focus = () => { focused = button; }; });
  vm.runInNewContext(script, {
    document, window: {}, localStorage: storage,
    navigator: { clipboard: { writeText: options.clipboard || (async () => {}) } },
    fetch: async () => {
      if (options.mediaFails) throw new Error('Offline');
      return { ok: true, json: async () => options.media || { albums: {} } };
    },
    setTimeout: () => 1, clearTimeout: () => {}
  });
  const click = selector => {
    const node = typeof selector === 'string' ? document.querySelector(selector) : selector;
    node.dispatchEvent(new Event('click', { bubbles: true }));
  };
  const key = (target, value) => {
    const event = new Event('keydown', { cancelable: true });
    event.key = value;
    target.dispatchEvent(event);
  };
  return { document, Event, dialog, click, key, values, focused: () => focused };
}

test('all internal links, local assets, and SVG references resolve without placeholders', async () => {
  const { document } = parseHTML(html);
  const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const node of document.querySelectorAll('[href],[src]')) {
    const url = node.getAttribute('href') ?? node.getAttribute('src');
    assert.ok(url && url !== '#', 'No placeholder links');
    if (url.startsWith('#')) assert.ok(document.getElementById(url.slice(1)), url);
    else if (url.startsWith('/')) {
      let exists = false;
      for (const base of ['src', 'public']) {
        try { await access(path.join(root, base, url)); exists = true; } catch {}
      }
      assert.ok(exists, url);
    }
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      assert.ok(node.getAttribute('rel')?.includes('noopener'), url);
    }
  }
  const css = await readFile(path.join(root, 'src/css/portfolio.css'), 'utf8');
  for (const [, url] of css.matchAll(/url\(["']?(\/[^"')]+)["']?\)/g)) await access(path.join(root, 'public', url));
  assert.equal(document.querySelectorAll('h1').length, 1);
  assert.equal(document.querySelectorAll('.project-card').length, 4);
  assert.equal(document.querySelectorAll('.moment-card').length, 4);
  assert.doesNotMatch(html, /googletagmanager|Lorem ipsum|Your Name|UA-122228201/);
});

test('project filters change visible projects, count, and pressed states', () => {
  const { document, click } = setup();
  const visible = () => [...document.querySelectorAll('.project-card')].filter(card => !card.hidden);
  click('[data-filter="ml"]');
  assert.equal(visible().length, 2);
  assert.ok(visible().every(card => card.dataset.category === 'ml'));
  assert.equal(document.querySelector('.project-count').textContent, '2 projects');
  assert.equal(document.querySelector('[data-filter="ml"]').getAttribute('aria-pressed'), 'true');
  click('[data-filter="infrastructure"]');
  assert.ok(visible().every(card => card.dataset.category === 'infrastructure'));
  click('[data-filter="all"]');
  assert.equal(visible().length, 4);
});

test('all project and event buttons open details, tolerate empty albums, and restore focus', async () => {
  const { document, dialog, click, focused } = setup();
  await flush();
  for (const trigger of document.querySelectorAll('[data-open]')) {
    click(trigger);
    assert.ok(dialog.hasAttribute('open'));
    assert.ok(document.querySelector('#dialog-title').textContent.length > 4);
    assert.ok(document.querySelectorAll('#dialog-details li').length >= 1);
    assert.ok(document.body.classList.contains('dialog-open'));
    assert.ok(document.querySelector('.dialog-gallery').hidden);
    assert.ok(dialog.classList.contains('no-photos'));
    const repository = document.querySelector('#dialog-links a[target="_blank"]');
    if (trigger.dataset.open === 'kubernetes') assert.equal(repository.href, 'https://github.com/OmarBouat/K8S_IaC');
    else assert.equal(repository, null);
    click('.dialog-close');
    assert.equal(dialog.hasAttribute('open'), false);
    assert.equal(document.body.classList.contains('dialog-open'), false);
    assert.equal(focused(), trigger);
  }
});

test('photo albums support covers, thumbnails, captions, arrows, keyboard, and load failure', async () => {
  const photos = [1, 2, 3].map(n => ({ src: '/images/hackathons/technova/0' + n + '.jpg', alt: 'Technova photo ' + n, caption: 'Moment ' + n }));
  const { document, dialog, click, key, Event } = setup({ media: { albums: { technova: photos } } });
  await flush();
  const card = document.querySelector('[data-album-card="technova"]');
  assert.equal(card.querySelector('[data-cover-image]').getAttribute('src'), photos[0].src);
  assert.equal(card.querySelector('[data-photo-count]').textContent, '3 photos');
  assert.ok(card.querySelector('[data-cover-fallback]').hidden);
  click(card.querySelector('[data-open]'));
  assert.equal(document.querySelector('.dialog-gallery').hidden, false);
  assert.equal(document.querySelectorAll('.gallery-thumbnail').length, 3);
  assert.equal(document.querySelector('#gallery-counter').textContent, '1 / 3');
  click('.gallery-next');
  assert.equal(document.querySelector('#gallery-caption').textContent, 'Moment 2');
  key(dialog, 'ArrowRight');
  assert.equal(document.querySelector('#gallery-counter').textContent, '3 / 3');
  key(dialog, 'ArrowRight');
  assert.equal(document.querySelector('#gallery-counter').textContent, '1 / 3');
  click('.gallery-prev');
  assert.equal(document.querySelector('#gallery-counter').textContent, '3 / 3');
  click(document.querySelectorAll('.gallery-thumbnail')[1]);
  assert.equal(document.querySelector('#gallery-image').getAttribute('src'), photos[1].src);
  assert.equal(document.querySelector('#gallery-original').getAttribute('href'), photos[1].src);
  assert.equal(document.querySelectorAll('.gallery-thumbnail')[1].getAttribute('aria-pressed'), 'true');
  document.querySelector('#gallery-image').dispatchEvent(new Event('error'));
  assert.equal(document.querySelector('#gallery-error').hidden, false);
  click('.gallery-next');
  assert.equal(document.querySelector('#gallery-error').hidden, true);
  assert.equal(document.querySelector('#gallery-image').hidden, false);
});

test('one-photo albums disable arrows and hide thumbnails; manifest failure keeps details usable', async () => {
  const single = setup({ media: { albums: { llm: [{ src: '/images/projects/llm/one.jpg', alt: 'LLM screenshot', caption: '' }] } } });
  await flush();
  single.click('[data-open="llm"]');
  assert.equal(single.document.querySelector('#gallery-counter').textContent, '1 / 1');
  assert.equal(single.document.querySelector('.gallery-prev').disabled, true);
  assert.equal(single.document.querySelector('.gallery-thumbnails').hidden, true);
  const offline = setup({ mediaFails: true });
  await flush();
  offline.click('[data-open="llm"]');
  assert.ok(offline.dialog.hasAttribute('open'));
  assert.ok(offline.dialog.classList.contains('no-photos'));
});

test('theme preference loads before paint, persists on toggle, and tolerates blocked storage', () => {
  const theme = setup({ savedTheme: 'dark' });
  assert.equal(theme.document.documentElement.dataset.theme, 'dark');
  assert.equal(theme.document.querySelector('.theme-toggle').getAttribute('aria-pressed'), 'true');
  theme.click('.theme-toggle');
  assert.equal(theme.document.documentElement.dataset.theme, 'light');
  assert.equal(theme.values.get('omar-portfolio-theme'), 'light');
  assert.equal(theme.document.querySelector('meta[name="theme-color"]').getAttribute('content'), '#fafafc');
  const blocked = setup({ blockStorage: true });
  blocked.click('.theme-toggle');
  assert.equal(blocked.document.documentElement.dataset.theme, 'dark');
});

test('mobile menu closes after selection and Escape, and clipboard errors are announced', async () => {
  let copied;
  const app = setup({ clipboard: async text => { copied = text; } });
  app.click('.menu-toggle');
  assert.equal(app.document.querySelector('.menu-toggle').getAttribute('aria-expanded'), 'true');
  app.click('.nav-links a');
  assert.equal(app.document.querySelector('.menu-toggle').getAttribute('aria-expanded'), 'false');
  app.click('.menu-toggle');
  app.key(app.document, 'Escape');
  assert.equal(app.document.querySelector('.nav-links').classList.contains('is-open'), false);
  app.click('.copy-email');
  await flush();
  assert.equal(copied, 'omar.bouattour.03@gmail.com');
  assert.equal(app.document.querySelector('.copy-email span').textContent, 'Email copied');
  const denied = setup({ clipboard: async () => { throw new Error('Denied'); } });
  denied.click('.copy-email');
  await flush();
  assert.match(denied.document.querySelector('#copy-status').textContent, /Copy unavailable/);
});

test('media discovery orders photos naturally, preserves captions, encodes URLs, and supports portrait replacement', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'omar-photo-test-'));
  try {
    await mkdir(path.join(fixture, 'content'), { recursive: true });
    await mkdir(path.join(fixture, 'public/images/projects/demo'), { recursive: true });
    await mkdir(path.join(fixture, 'public/images/profile'), { recursive: true });
    await writeFile(path.join(fixture, 'content/albums.json'), JSON.stringify({ demo: { folder: 'projects/demo', title: 'Demo project' }, empty: { folder: 'hackathons/empty', title: 'Empty album' } }));
    for (const file of ['10.jpg', '2.jpg', '1 photo.webp', 'notes.txt']) await writeFile(path.join(fixture, 'public/images/projects/demo', file), 'test fixture');
    await writeFile(path.join(fixture, 'public/images/projects/demo/captions.json'), JSON.stringify({ '2.jpg': 'A useful caption' }));
    await writeFile(path.join(fixture, 'public/images/profile/omar.jpg'), 'test fixture');
    await writeFile(path.join(fixture, 'public/images/profile/portrait.png'), 'test fixture');
    const result = await buildMedia(fixture);
    assert.deepEqual(result.albums.demo.map(photo => photo.src), ['/images/projects/demo/1%20photo.webp', '/images/projects/demo/2.jpg', '/images/projects/demo/10.jpg']);
    assert.equal(result.albums.demo[1].caption, 'A useful caption');
    assert.equal(result.albums.demo[1].alt, 'A useful caption');
    assert.equal(result.albums.demo[0].alt, 'Demo project — photo 1');
    assert.deepEqual(result.albums.empty, []);
    assert.equal(result.portrait.src, '/images/profile/portrait.png');
    await writeFile(path.join(fixture, 'content/albums.json'), JSON.stringify({ bad: { folder: '../../outside', title: 'Invalid' } }));
    await assert.rejects(buildMedia(fixture), /Invalid photo album folder/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});

test('HTTP serves the portrait, photo manifest, CV, and assets, and rejects private or unknown paths', async () => {
  const server = createServer(respond);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const [route, type] of [['/', 'text/html'], ['/main.js', 'text/javascript'], ['/theme.js', 'text/javascript'], ['/css/portfolio.css', 'text/css'], ['/fonts/dm-sans.woff2', 'font/woff2'], ['/images/profile/omar.jpg', 'image/jpeg'], ['/media.json', 'application/json'], ['/Omar_Bouattour.pdf', 'application/pdf']]) {
      const response = await fetch(origin + route);
      assert.equal(response.status, 200, route);
      assert.ok(response.headers.get('content-type').startsWith(type), route);
      if (route.endsWith('.pdf')) {
        const body = Buffer.from(await response.arrayBuffer());
        assert.equal(body.subarray(0, 4).toString(), '%PDF');
        assert.deepEqual(body, await readFile(path.join(root, 'public/Omar_Bouattour.pdf')));
      }
      if (route === '/media.json') {
        const manifest = await response.json();
        assert.ok(manifest.portrait.src.startsWith('/images/profile/'));
        assert.ok(Array.isArray(manifest.albums.technova));
      }
    }
    for (const route of ['/does-not-exist', '/package.json', '/%2e%2e%2fpackage.json', '/.openai/hosting.json', '/content/albums.json']) assert.equal((await fetch(origin + route)).status, 404, route);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
