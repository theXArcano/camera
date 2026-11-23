/**
 * Regras puras sobre as câmeras que o iOS informa. Sem DOM, para poder testar.
 */

const ORDER = { '0,5x': 0, '1x': 1, Tele: 2, Auto: 3, Selfie: 4 };

/**
 * Traduz o nome técnico da câmera (ex.: "Câmera Ultra-angular Traseira")
 * para um rótulo curto e uma descrição.
 * @param {string} label
 * @returns {{short: string, long: string, order: number}}
 */
export function describeLens(label) {
  const l = (label || '').toLowerCase();
  let short;
  let long;
  if (/front|frontal/.test(l)) [short, long] = ['Selfie', 'frontal'];
  else if (/ultra/.test(l)) [short, long] = ['0,5x', 'ultra-angular'];
  else if (/tele/.test(l)) [short, long] = ['Tele', 'teleobjetiva'];
  else if (/dupla|dual|tripla|triple/.test(l)) [short, long] = ['Auto', 'várias lentes juntas'];
  else if (/tr[aá]s|back|rear/.test(l)) [short, long] = ['1x', 'principal'];
  else [short, long] = ['Câmera', label || 'sem nome'];
  return { short, long, order: ORDER[short] ?? 5 };
}

/** Ordena as câmeras do jeito que o app Câmera mostra: 0,5x, 1x, tele, selfie. */
export function sortLenses(devices) {
  return [...devices].sort((a, b) => describeLens(a.label).order - describeLens(b.label).order);
}

/**
 * Atalhos de zoom digital. Na ultra-angular, zoom 2 equivale ao "1x" do app Câmera.
 * @returns {Array<[string, number]>} pares [rótulo, valor de zoom]
 */
export function zoomPresets(label, min, max) {
  const ultra = /ultra/i.test(label || '');
  const all = ultra
    ? [
        ['0,5x', 1],
        ['1x', 2],
        ['2x', 4],
      ]
    : [
        ['1x', 1],
        ['2x', 2],
        ['3x', 3],
      ];
  return all.filter(([, value]) => value >= min && value <= max);
}

/** Qualidades oferecidas. "max" pede o maior sensor; o iOS entrega o que der. */
export const QUALITY = {
  max: { width: { ideal: 4032 }, height: { ideal: 3024 } },
  hd: { width: { ideal: 1920 }, height: { ideal: 1080 } },
  low: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

/** Espera entre tentativas de religar: 2s, 4s, 8s... até 30s. */
export function retryDelay(attempt) {
  return Math.min(2000 * 2 ** attempt, 30000);
}
