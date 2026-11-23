import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileName } from '../../js/share.js';

const id = Date.UTC(2026, 10, 22, 21, 30, 5, 123);

test('nome de foto usa jpg e a data da captura', () => {
  assert.equal(
    fileName({ id, kind: 'foto', blob: { type: 'image/jpeg' } }),
    'foto-2026-11-22T21-30-05-123Z.jpg',
  );
});

test('vídeo do iPhone sai como mp4', () => {
  assert.equal(
    fileName({ id, kind: 'video', blob: { type: 'video/mp4' } }),
    'video-2026-11-22T21-30-05-123Z.mp4',
  );
});

test('vídeo webm mantém a extensão webm', () => {
  assert.match(fileName({ id, kind: 'video', blob: { type: 'video/webm' } }), /\.webm$/);
});
