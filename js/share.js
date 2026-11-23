/**
 * Envio para o app Fotos pela folha de compartilhar do iOS.
 * Um app web não pode gravar no Fotos sozinho: o usuário toca em "Salvar Imagem/Vídeo".
 */

/** Monta o nome do arquivo a partir do tipo e da data da captura. Função pura. */
export function fileName(item) {
  const video = item.kind !== 'foto';
  const type = (item.blob && item.blob.type) || '';
  const ext = video ? (/webm/.test(type) ? 'webm' : 'mp4') : 'jpg';
  const stamp = new Date(item.id).toISOString().replace(/[:.]/g, '-');
  return `${video ? 'video' : 'foto'}-${stamp}.${ext}`;
}

export function toFile(item) {
  const fallback = item.kind === 'foto' ? 'image/jpeg' : 'video/mp4';
  return new File([item.blob], fileName(item), { type: item.blob.type || fallback });
}

/** Limite de arquivos por vez na folha de compartilhar (lotes grandes falham no iOS). */
export const SHARE_BATCH = 20;

/**
 * @returns {Promise<'saved'|'cancelled'|'unsupported'|'error'>}
 */
export async function shareToPhotos(items) {
  if (!items.length) return 'cancelled';
  const files = items.map(toFile);
  if (!navigator.canShare || !navigator.canShare({ files })) return 'unsupported';
  try {
    await navigator.share({ files });
    return 'saved';
  } catch (e) {
    return e && e.name === 'AbortError' ? 'cancelled' : 'error';
  }
}
