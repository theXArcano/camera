/**
 * Galeria interna: guarda fotos e vídeos no IndexedDB do próprio app.
 * Em app de Tela de Início esses dados não são apagados pelo limite de 7 dias do Safari.
 *
 * Item: { id: number (timestamp), kind: 'foto' | 'video', blob: Blob, saved: boolean }
 */
const DB_NAME = 'lentes';
const STORE = 'midia';

function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class MediaStore {
  constructor() {
    this.db = null;
  }

  async open() {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    this.db = await request(req);
    return this;
  }

  store(mode) {
    return this.db.transaction(STORE, mode).objectStore(STORE);
  }

  /** Todos os itens, do mais novo para o mais antigo. */
  async all() {
    const list = await request(this.store('readonly').getAll());
    return list.sort((a, b) => b.id - a.id);
  }

  put(item) {
    return request(this.store('readwrite').put(item));
  }

  delete(id) {
    return request(this.store('readwrite').delete(id));
  }
}

/** Pede ao navegador para não apagar a galeria quando faltar espaço. */
export async function requestPersistence() {
  if (!navigator.storage || !navigator.storage.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
