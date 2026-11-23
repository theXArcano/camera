/**
 * Seleção estilo app Fotos do iPhone:
 * - tocar e segurar entra no modo de seleção e marca o item;
 * - depois de segurar, arrastar marca (ou desmarca) todos entre o primeiro e o atual;
 * - no modo de seleção, arrastar na horizontal também marca vários; na vertical rola a grade;
 * - toque simples no modo de seleção alterna o item.
 */

export const LONG_PRESS_MS = 420;
const MOVE_TOLERANCE = 10;
const EDGE = 60;
const SCROLL_SPEED = 14;

/**
 * Aplica o arrasto: parte da seleção que existia antes do gesto (base)
 * e põe `value` em todos os itens do intervalo [from, to].
 * Função pura, testada em tests/unit/selection.test.js.
 * @param {Set<number>} base
 * @param {number[]} ids ids na ordem em que aparecem na grade
 * @param {number} from índice onde o gesto começou
 * @param {number} to índice atual
 * @param {boolean} value true marca, false desmarca
 * @returns {Set<number>}
 */
export function applyRange(base, ids, from, to, value) {
  const result = new Set(base);
  const [a, b] = from <= to ? [from, to] : [to, from];
  for (let i = Math.max(0, a); i <= Math.min(ids.length - 1, b); i++) {
    if (value) result.add(ids[i]);
    else result.delete(ids[i]);
  }
  return result;
}

/** Decide se um movimento inicial é arrasto horizontal (selecionar) ou vertical (rolar). */
export function classifyMove(dx, dy) {
  if (Math.abs(dx) < MOVE_TOLERANCE && Math.abs(dy) < MOVE_TOLERANCE) return 'none';
  return Math.abs(dx) > Math.abs(dy) ? 'select' : 'scroll';
}

/**
 * Liga os gestos a uma grade. A grade precisa ter filhos `.cell` com `data-idx`.
 * @param {HTMLElement} grid
 * @param {object} h
 * @param {() => number[]} h.ids ids na ordem da grade
 * @param {() => Set<number>} h.selected seleção atual
 * @param {() => boolean} h.isSelecting
 * @param {() => void} h.enter entra no modo de seleção
 * @param {(s: Set<number>) => void} h.change nova seleção
 * @param {(id: number) => void} h.open abre o item (fora do modo de seleção)
 */
export function attachSelection(grid, h) {
  let g = null;
  let raf = 0;

  const indexAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const cell = el && el.closest('.cell');
    return cell && grid.contains(cell) ? Number(cell.dataset.idx) : null;
  };

  const paint = () => {
    if (!g || !g.dragging) return;
    const idx = indexAt(g.x, g.y);
    if (idx !== null) g.last = idx;
    h.change(applyRange(g.base, h.ids(), g.start, g.last, g.value));
  };

  const autoScroll = () => {
    if (!g || !g.dragging) return;
    const r = grid.getBoundingClientRect();
    if (g.y < r.top + EDGE) grid.scrollTop -= SCROLL_SPEED;
    else if (g.y > r.bottom - EDGE) grid.scrollTop += SCROLL_SPEED;
    paint();
    raf = requestAnimationFrame(autoScroll);
  };

  const beginDrag = (value) => {
    g.dragging = true;
    g.value = value;
    g.base = new Set(h.selected());
    g.last = g.start;
    paint();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(autoScroll);
  };

  const end = () => {
    if (g) {
      clearTimeout(g.timer);
      if (g.cell) g.cell.classList.remove('pressing');
    }
    cancelAnimationFrame(raf);
    g = null;
  };

  grid.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) return end();
      const t = e.touches[0];
      const cell = e.target.closest('.cell');
      if (!cell) return;
      g = {
        start: Number(cell.dataset.idx),
        id: Number(cell.dataset.id),
        cell,
        x0: t.clientX,
        y0: t.clientY,
        x: t.clientX,
        y: t.clientY,
        kind: 'none',
        long: false,
        dragging: false,
      };
      cell.classList.add('pressing');
      g.timer = setTimeout(() => {
        if (!g || g.kind !== 'none') return;
        g.long = true;
        g.cell.classList.remove('pressing');
        if (!h.isSelecting()) h.enter();
        if (navigator.vibrate) navigator.vibrate(10);
        beginDrag(!h.selected().has(g.id));
      }, LONG_PRESS_MS);
    },
    { passive: true },
  );

  grid.addEventListener(
    'touchmove',
    (e) => {
      if (!g) return;
      const t = e.touches[0];
      g.x = t.clientX;
      g.y = t.clientY;
      if (g.dragging) {
        e.preventDefault();
        return;
      }
      if (g.kind !== 'none') return;
      g.kind = classifyMove(g.x - g.x0, g.y - g.y0);
      if (g.kind === 'none') return;
      clearTimeout(g.timer);
      g.cell.classList.remove('pressing');
      if (g.kind === 'select' && h.isSelecting()) {
        e.preventDefault();
        beginDrag(!h.selected().has(g.id));
      }
    },
    { passive: false },
  );

  grid.addEventListener('touchend', (e) => {
    if (!g) return;
    const tapped = g.kind === 'none' && !g.long;
    const { id } = g;
    const consumed = g.long || g.dragging || (tapped && h.isSelecting());
    if (tapped && h.isSelecting()) {
      const next = new Set(h.selected());
      if (next.has(id)) next.delete(id);
      else next.add(id);
      h.change(next);
    }
    if (consumed) e.preventDefault();
    end();
  });

  grid.addEventListener('touchcancel', end);
  grid.addEventListener('contextmenu', (e) => e.preventDefault());

  // Mouse e testes: clique alterna no modo de seleção, ou abre o item.
  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const id = Number(cell.dataset.id);
    if (h.isSelecting()) {
      const next = new Set(h.selected());
      if (next.has(id)) next.delete(id);
      else next.add(id);
      h.change(next);
    } else {
      h.open(id);
    }
  });
}
