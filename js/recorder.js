/**
 * Gravação de vídeo com MediaRecorder. No iOS o formato é MP4 (H.264 + AAC).
 * Se o iOS cortar a câmera no meio, o trecho já gravado é entregue normalmente.
 */
import { note } from './log.js';
import { QUALITY } from './lenses.js';

const CANDIDATES = [
  'video/mp4;codecs=avc1.640028,mp4a.40.2',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4',
  'video/webm',
];
const BITRATE = 8_000_000;
/** Resolução usada durante a gravação quando a qualidade é "Máxima", para esquentar menos. */
const VIDEO_WHILE_RECORDING = { width: { ideal: 1920 }, height: { ideal: 1440 } };

/** @returns {string|null} null = sem suporte; '' = formato padrão do navegador */
export function pickMime() {
  if (typeof MediaRecorder === 'undefined') return null;
  return CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) || '';
}

let recorder = null;
let chunks = [];
let startedAt = 0;
let mic = null;

export const isRecording = () => recorder !== null;
export const elapsedMs = () => (recorder ? Date.now() - startedAt : 0);

async function ensureMic() {
  if (mic && mic.getAudioTracks().some((t) => t.readyState === 'live')) return mic;
  try {
    mic = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    mic = null;
    note(`Sem microfone: ${e.name} (vídeo sem som)`);
  }
  return mic;
}

/** Libera o microfone (ao minimizar o app). */
export function releaseMic() {
  if (mic) mic.getTracks().forEach((t) => t.stop());
  mic = null;
}

/**
 * @param {MediaStreamTrack} videoTrack
 * @param {boolean} maxQuality
 * @param {(blob: Blob) => void} onDone chamado quando a gravação termina
 */
export async function startRecording(videoTrack, maxQuality, onDone) {
  const mime = pickMime();
  if (mime === null) throw new Error('Este iOS não grava vídeo pelo navegador');
  if (maxQuality) {
    await videoTrack
      .applyConstraints(VIDEO_WHILE_RECORDING)
      .catch((e) => note(`resolução p/ vídeo: ${e.message}`));
  }
  const audio = await ensureMic();
  const mixed = new MediaStream([videoTrack, ...(audio ? audio.getAudioTracks() : [])]);
  const rec = new MediaRecorder(mixed, mime ? { mimeType: mime, videoBitsPerSecond: BITRATE } : {});
  chunks = [];
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size) chunks.push(e.data);
  };
  rec.onstop = () => {
    recorder = null;
    if (maxQuality && videoTrack.readyState === 'live') {
      videoTrack.applyConstraints(QUALITY.max).catch(() => {});
    }
    if (!chunks.length) {
      note('Gravação vazia');
      return;
    }
    const blob = new Blob(chunks, { type: rec.mimeType || chunks[0].type || 'video/mp4' });
    chunks = [];
    note(`Vídeo ${Math.round((Date.now() - startedAt) / 1000)}s, ${(blob.size / 1048576).toFixed(1)} MB`);
    onDone(blob);
  };
  rec.start(1000);
  recorder = rec;
  startedAt = Date.now();
  note(`Gravação iniciada: ${rec.mimeType || mime || 'padrão'}`);
}

export function stopRecording() {
  if (!recorder) return;
  try {
    if (recorder.state !== 'inactive') recorder.stop();
  } catch {
    recorder = null;
  }
}
