import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createServer } from 'node:http';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { respond } from '../scripts/serve.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'src/index.html'), 'utf8');
const script = await readFile(path.join(root, 'src/main.js'), 'utf8');

function setup(clipboard = async () => {}) {
  const window = parseHTML(html);
  const { document, Event } = window;
  const dialog = document.querySelector('dialog');
  dialog.showModal = () => dialog.setAttribute('open', '');
  dialog.close = () => { dialog.removeAttribute('open'); dialog.dispatchEvent(new Event('close')); };
  let focused = null;
  document.querySelectorAll('button').forEach(button => { button.focus = () => { focused = button; }; });
  vm.runInNewContext(script, {
    document, window: {}, navigator: { clipboard: { writeText: clipboard } },
    setTimeout: () => 1, clearTimeout: () => {}
  });
  const click = selector => document.querySelector(selector).dispatchEvent(new Event('click', { bubbles: true }));
  return { document, Event, dialog, click, focused: () => focused };
}

test('all internal anchors, local assets, and SVG references resolve', async () => {
  const { document } = parseHTML(html);
  const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(ids.length, new Set(ids).size, 'IDs must be unique');
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
  for (const [, url] of css.matchAll(/url\(["']?(\/[^"')]+)["']?\)/g)) {
    await access(path.join(root, 'public', url));
  }
  assert.equal(document.querySelectorAll('h1').length, 1);
  assert.equal(document.querySelectorAll('.project-card').length, 4);
  assert.doesNotMatch(html, /googletagmanager|Lorem ipsum|Your Name|UA-122228201/);
});

test('project filters show the matching cards and update accessibility state', () => {
  const { document, click } = setup();
  const visible = () => [...document.querySelectorAll('.project-card')].filter(card => !card.hidden);
  assert.equal(visible().length, 4);
  click('[data-filter="ml"]');
  assert.equal(visible().length, 2);
  assert.ok(visible().every(card => card.dataset.category === 'ml'));
  assert.equal(document.querySelector('[data-filter="ml"]').getAttribute('aria-pressed'), 'true');
  assert.equal(document.querySelector('.project-count').textContent, '02 PROJECTS');
  click('[data-filter="infrastructure"]');
  assert.ok(visible().every(card => card.dataset.category === 'infrastructure'));
  click('[data-filter="all"]');
  assert.equal(visible().length, 4);
});

test('each project opens matching details; closing restores scroll and focus', () => {
  const { document, click, dialog, focused } = setup();
  for (const trigger of document.querySelectorAll('[data-project]')) {
    click('[data-project="' + trigger.dataset.project + '"]');
    assert.ok(dialog.hasAttribute('open'));
    assert.ok(document.querySelector('#dialog-title').textContent.length > 10);
    assert.ok(document.querySelectorAll('#dialog-details li').length >= 3);
    assert.ok(document.body.classList.contains('dialog-open'));
    const repository = document.querySelector('#dialog-links a[target="_blank"]');
    if (trigger.dataset.project === 'kubernetes') {
      assert.equal(repository.href, 'https://github.com/OmarBouat/K8S_IaC');
    } else assert.equal(repository, null);
    click('.dialog-close');
    assert.equal(dialog.hasAttribute('open'), false);
    assert.equal(document.body.classList.contains('dialog-open'), false);
    assert.equal(focused(), trigger);
  }
});

test('mobile navigation toggles and closes when selecting a section or pressing Escape', () => {
  const { document, Event, click } = setup();
  const toggle = document.querySelector('.menu-toggle');
  click('.menu-toggle');
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  click('.nav-links a');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  click('.menu-toggle');
  const escape = new Event('keydown');
  escape.key = 'Escape';
  document.dispatchEvent(escape);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(document.querySelector('.nav-links').classList.contains('is-open'), false);
});

test('copy email reports success and handles unavailable clipboard access', async () => {
  let copied;
  const success = setup(async text => { copied = text; });
  success.click('.copy-email');
  await new Promise(setImmediate);
  assert.equal(copied, 'omar.bouattour.03@gmail.com');
  assert.equal(success.document.querySelector('.copy-email span').textContent, 'Email copied');
  const failure = setup(async () => { throw new Error('Permission denied'); });
  failure.click('.copy-email');
  await new Promise(setImmediate);
  assert.equal(failure.document.querySelector('.copy-email span').textContent, 'Use the email link');
  assert.match(failure.document.querySelector('#copy-status').textContent, /Copy unavailable/);
});

test('the development server serves the portfolio and original PDF, and rejects unknown files', async () => {
  const server = createServer(respond);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const [route, type] of [['/', 'text/html'], ['/main.js', 'text/javascript'], ['/css/portfolio.css', 'text/css'], ['/fonts/dm-sans.woff2', 'font/woff2'], ['/Omar_Bouattour.pdf', 'application/pdf']]) {
      const response = await fetch(origin + route);
      assert.equal(response.status, 200, route);
      assert.ok(response.headers.get('content-type').startsWith(type), route);
      if (route.endsWith('.pdf')) {
        const body = Buffer.from(await response.arrayBuffer());
        assert.equal(body.subarray(0, 4).toString(), '%PDF');
        assert.deepEqual(body, await readFile(path.join(root, 'public/Omar_Bouattour.pdf')));
      }
    }
    for (const route of ['/does-not-exist', '/package.json', '/%2e%2e%2fpackage.json', '/.openai/hosting.json']) {
      assert.equal((await fetch(origin + route)).status, 404, route);
    }
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
