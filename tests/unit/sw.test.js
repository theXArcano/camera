import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const precache = [...sw.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]);

test('todo arquivo do app está na lista do modo offline', () => {
  const appFiles = [
    ...readdirSync(join(root, 'js')).map((f) => `js/${f}`),
    ...readdirSync(join(root, 'css')).map((f) => `css/${f}`),
    ...readdirSync(join(root, 'icons')).map((f) => `icons/${f}`),
  ];
  const missing = appFiles.filter((f) => !precache.includes(f));
  assert.deepEqual(missing, [], `Adicione ao PRECACHE do sw.js: ${missing.join(', ')}`);
});

test('a lista do modo offline não aponta para arquivos que não existem', () => {
  for (const file of precache.filter(Boolean)) {
    assert.doesNotThrow(() => readFileSync(join(root, file)), `sw.js lista ${file}, que não existe`);
  }
});

test('index.html referencia os arquivos que existem', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"#:]+)"/g)) {
    assert.doesNotThrow(() => readFileSync(join(root, ref)), `index.html aponta para ${ref}, que não existe`);
  }
});
