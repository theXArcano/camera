/**
 * Galeria do app: tudo que é capturado entra aqui na hora (salvamento automático),
 * e daqui vai para o app Fotos em lote. Seleção igual à do app Fotos do iPhone.
 */
import { MediaStore } from './media-store.js';
import { shareToPhotos, SHARE_BATCH } from './share.js';
import { attachSelection } from './selection.js';
import { note } from './log.js';
import { prefs } from './prefs.js';
import { $, toast, confirmSheet, plural } from './ui.js';

const MAX_RENDERED = 300;

const store = new MediaStore();
let items = [];
const urls = new Map();
let selecting = false;
let selected = new Set();
let viewing = null;

const ready = store
  .open()
  .then(async () => {
    items = await store.all();
    refreshThumb();
  })
  .catch((e) => note(`Galeria indisponível: ${e.message}`));

function urlOf(item) {
  if (!urls.has(item.id)) urls.set(item.id, URL.createObjectURL(item.blob));
  return urls.get(item.id);
}

function forget(id) {
  if (urls.has(id)) {
    URL.revokeObjectURL(urls.get(id));
    urls.delete(id);
  }
}

const pending = () => items.filter((i) => !i.saved);

export function refreshThumb() {
  const thumb = $('thumb');
  const first = items[0];
  thumb.querySelectorAll('video').forEach((el) => el.remove());
  thumb.style.backgroundImage = '';
  if (first) {
    if (first.kind === 'foto') thumb.style.backgroundImage = `url(${urlOf(first)})`;
    else
      thumb.insertAdjacentHTML(
        'afterbegin',
        `<video src="${urlOf(first)}#t=0.1" muted playsinline preload="metadata"></video>`,
      );
  }
  const n = pending().length;
  $('badge').textContent = String(n);
  $('badge').hidden = n === 0;
}

/** Guarda uma captura nova. É o "salvar automático". */
export async function keep(blob, kind) {
  const item = { id: Date.now(), kind, blob, saved: false };
  items.unshift(item);
  refreshThumb();
  try {
    await ready;
    await store.put(item);
    toast(kind === 'foto' ? 'Foto guardada' : 'Vídeo guardado');
  } catch (e) {
    note(`Não consegui guardar: ${e.message}`);
    toast('Não consegui guardar, salve agora');
    openViewer(item);
    return;
  }
  if ($('askSave').checked) sendToPhotos([item]);
}

async function sendToPhotos(list) {
  const result = await shareToPhotos(list.slice(0, SHARE_BATCH));
  if (result === 'saved') {
    for (const item of list.slice(0, SHARE_BATCH)) {
      item.saved = true;
      await store.put(item).catch(() => {});
    }
    refreshThumb();
    if (!$('gallery').hidden) render();
    if (list.length > SHARE_BATCH) toast('Toque de novo para o próximo lote');
  } else if (result === 'unsupported') {
    toast('Este iPhone não abriu o menu de salvar');
  } else if (result === 'error') {
    toast('Toque de novo em Salvar');
  }
  return result === 'saved';
}

async function remove(list) {
  for (const item of list) {
    await store.delete(item.id).catch(() => {});
    forget(item.id);
  }
  const gone = new Set(list.map((i) => i.id));
  items = items.filter((i) => !gone.has(i.id));
  refreshThumb();
}

/* ---------- seleção ---------- */

function setSelecting(on) {
  selecting = on;
  if (!on) selected = new Set();
  $('grid').classList.toggle('selecting', on);
  $('gSelect').textContent = on ? 'Cancelar' : 'Selecionar';
  $('normalBar').hidden = on;
  $('selBar').hidden = !on;
  paintSelection();
}

function paintSelection() {
  $('grid')
    .querySelectorAll('.cell')
    .forEach((c) => c.classList.toggle('picked', selected.has(Number(c.dataset.id))));
  const n = selected.size;
  $('sCount').textContent = n ? plural(n, 'item selecionado', 'itens selecionados') : 'Selecione itens';
  $('sSave').disabled = n === 0;
  $('sDel').disabled = n === 0;
}

const selectedItems = () => items.filter((i) => selected.has(i.id));

/* ---------- grade ---------- */

function render() {
  const n = pending().length;
  $('gTitle').textContent = `Galeria (${items.length})`;
  $('saveAll').textContent = n ? `Salvar ${n} pendente${n > 1 ? 's' : ''} no Fotos` : 'Nada pendente';
  $('gSelect').hidden = items.length === 0;
  const shown = items.slice(0, MAX_RENDERED);
  $('grid').innerHTML = shown.length
    ? shown
        .map((item, idx) => {
          const url = urlOf(item);
          const isPhoto = item.kind === 'foto';
          const inner = isPhoto
            ? ''
            : `<video src="${url}#t=0.1" muted playsinline preload="metadata"></video><span class="tag">vídeo</span>`;
          const style = isPhoto ? ` style="background-image:url(${url})"` : '';
          const ok = item.saved ? '<span class="ok">✓</span>' : '';
          return `<button class="cell" data-idx="${idx}" data-id="${item.id}"${style}>${inner}${ok}</button>`;
        })
        .join('')
    : '<div class="empty">Nenhuma captura ainda.</div>';
  paintSelection();
}

function openViewer(item) {
  viewing = item;
  const isPhoto = item.kind === 'foto';
  $('big').hidden = !isPhoto;
  $('bigv').hidden = isPhoto;
  if (isPhoto) $('big').src = urlOf(item);
  else $('bigv').src = urlOf(item);
  $('vSave').textContent = item.saved ? 'Salvar de novo' : 'Salvar no Fotos';
  $('viewer').hidden = false;
}

function closeViewer() {
  $('bigv').pause();
  $('viewer').hidden = true;
  viewing = null;
}

function deleteText(list) {
  const photos = list.filter((i) => i.kind === 'foto').length;
  const videos = list.length - photos;
  let what;
  if (!videos) what = plural(photos, 'foto', 'fotos');
  else if (!photos) what = plural(videos, 'vídeo', 'vídeos');
  else what = plural(list.length, 'item', 'itens');
  const kept = list.some((i) => i.saved) ? ' O que já foi salvo no app Fotos continua lá.' : '';
  return {
    text: `${list.length === 1 ? 'Este item será apagado' : 'Estes itens serão apagados'} do Lentes.${kept}`,
    action: `Apagar ${what}`,
  };
}

export function initGallery() {
  $('askSave').checked = prefs.get('askSave') === '1';
  $('askSave').addEventListener('change', (e) => prefs.set('askSave', e.target.checked ? '1' : '0'));

  $('thumb').addEventListener('click', () => {
    render();
    $('gallery').hidden = false;
  });
  $('gClose').addEventListener('click', () => {
    setSelecting(false);
    $('gallery').hidden = true;
  });
  $('gSelect').addEventListener('click', () => setSelecting(!selecting));

  attachSelection($('grid'), {
    ids: () => items.slice(0, MAX_RENDERED).map((i) => i.id),
    selected: () => selected,
    isSelecting: () => selecting,
    enter: () => setSelecting(true),
    change: (next) => {
      selected = next;
      paintSelection();
    },
    open: (id) => {
      const item = items.find((i) => i.id === id);
      if (item) openViewer(item);
    },
  });

  $('sSave').addEventListener('click', async () => {
    if (await sendToPhotos(selectedItems())) setSelecting(false);
  });
  $('sDel').addEventListener('click', async () => {
    const list = selectedItems();
    if (!list.length) return;
    const { text, action } = deleteText(list);
    if (!(await confirmSheet(text, action))) return;
    await remove(list);
    setSelecting(false);
    render();
  });

  $('saveAll').addEventListener('click', () => sendToPhotos(pending()));
  $('clearSaved').addEventListener('click', async () => {
    const done = items.filter((i) => i.saved);
    if (!done.length) return toast('Nenhuma captura salva no Fotos ainda');
    const ok = await confirmSheet(
      'As capturas que já foram para o app Fotos serão apagadas do Lentes. Elas continuam no Fotos.',
      `Apagar ${plural(done.length, 'item salvo', 'itens salvos')}`,
    );
    if (!ok) return;
    await remove(done);
    render();
  });

  $('vClose').addEventListener('click', () => {
    closeViewer();
    if (!$('gallery').hidden) render();
  });
  $('vSave').addEventListener('click', async () => {
    if (viewing && (await sendToPhotos([viewing]))) $('vSave').textContent = 'Salvar de novo';
  });
  $('vDel').addEventListener('click', async () => {
    if (!viewing) return;
    const item = viewing;
    const { text, action } = deleteText([item]);
    if (!(await confirmSheet(text, action))) return;
    await remove([item]);
    closeViewer();
    if (!$('gallery').hidden) render();
  });
}

export function galleryStats() {
  return { total: items.length, pending: pending().length };
}
