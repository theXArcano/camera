import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyRange, classifyMove } from '../../js/selection.js';

const ids = [10, 20, 30, 40, 50];

test('arrastar para frente marca o intervalo', () => {
  assert.deepEqual([...applyRange(new Set(), ids, 1, 3, true)].sort(), [20, 30, 40]);
});

test('arrastar para trás marca o mesmo intervalo', () => {
  assert.deepEqual([...applyRange(new Set(), ids, 3, 1, true)].sort(), [20, 30, 40]);
});

test('voltar o dedo desfaz o que saiu do intervalo, mantendo a seleção anterior', () => {
  const base = new Set([50]);
  const far = applyRange(base, ids, 0, 3, true);
  const back = applyRange(base, ids, 0, 1, true);
  assert.deepEqual([...far].sort(), [10, 20, 30, 40, 50]);
  assert.deepEqual([...back].sort(), [10, 20, 50]);
});

test('arrastar começando num item marcado desmarca', () => {
  const base = new Set(ids);
  assert.deepEqual([...applyRange(base, ids, 0, 2, false)].sort(), [40, 50]);
});

test('não altera a seleção original', () => {
  const base = new Set([10]);
  applyRange(base, ids, 0, 4, true);
  assert.deepEqual([...base], [10]);
});

test('índices fora da grade são limitados', () => {
  assert.equal(applyRange(new Set(), ids, -3, 99, true).size, 5);
});

test('movimento horizontal seleciona, vertical rola, pequeno é toque', () => {
  assert.equal(classifyMove(30, 5), 'select');
  assert.equal(classifyMove(4, 40), 'scroll');
  assert.equal(classifyMove(3, 3), 'none');
});
