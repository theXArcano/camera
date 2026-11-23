import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeLens, sortLenses, zoomPresets, retryDelay } from '../../js/lenses.js';

test('reconhece as câmeras com os nomes que o iOS usa em português', () => {
  assert.equal(describeLens('Câmera Ultra-angular Traseira').short, '0,5x');
  assert.equal(describeLens('Câmera Traseira').short, '1x');
  assert.equal(describeLens('Câmera Teleobjetiva Traseira').short, 'Tele');
  assert.equal(describeLens('Câmera Dupla Grande-angular Traseira').short, 'Auto');
  assert.equal(describeLens('Câmera Frontal').short, 'Selfie');
});

test('reconhece os nomes em inglês', () => {
  assert.equal(describeLens('Back Ultra Wide Camera').short, '0,5x');
  assert.equal(describeLens('Back Camera').short, '1x');
  assert.equal(describeLens('Front Camera').short, 'Selfie');
});

test('nome desconhecido ou vazio não quebra', () => {
  assert.deepEqual(describeLens(''), { short: 'Câmera', long: 'sem nome', order: 5 });
  assert.equal(describeLens(undefined).short, 'Câmera');
});

test('ordena como o app Câmera: 0,5x, 1x, tele, selfie', () => {
  const sorted = sortLenses([
    { label: 'Câmera Frontal' },
    { label: 'Câmera Traseira' },
    { label: 'Câmera Ultra-angular Traseira' },
  ]);
  assert.deepEqual(
    sorted.map((d) => describeLens(d.label).short),
    ['0,5x', '1x', 'Selfie'],
  );
});

test('atalhos de zoom na ultra-angular imitam 0,5x / 1x / 2x', () => {
  assert.deepEqual(zoomPresets('Câmera Ultra-angular Traseira', 1, 10), [
    ['0,5x', 1],
    ['1x', 2],
    ['2x', 4],
  ]);
  assert.deepEqual(zoomPresets('Câmera Ultra-angular Traseira', 1, 3), [
    ['0,5x', 1],
    ['1x', 2],
  ]);
});

test('espera entre tentativas dobra e para em 30 segundos', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 10].map(retryDelay), [2000, 4000, 8000, 16000, 30000, 30000]);
});
