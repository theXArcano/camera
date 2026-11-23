/**
 * Ponto de entrada: liga câmera, gravação, galeria e diagnóstico à interface.
 */
import { camera, hooks, startCamera, openLensAt, reopen, setZoom, onVisible } from './camera.js';
import { startRecording, stopRecording, isRecording, elapsedMs, releaseMic, pickMime } from './recorder.js';
import { initGallery, keep, galleryStats } from './gallery.js';
import { requestPersistence } from './media-store.js';
import { note, newestFirst } from './log.js';
import { prefs } from './prefs.js';
import { $, setStatus } from './ui.js';

const PHOTO_QUALITY = 0.95;
let mode = 'foto';
let timerTick = 0;

/* ---------- modo offline ---------- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .then(() => note('Modo offline pronto'))
    .catch((e) => note(`Offline indisponível: ${e.message}`));
}
requestPersistence().then((ok) => note(`Armazenamento persistente: ${ok ? 'sim' : 'não'}`));

/* ---------- foto ---------- */
function takePhoto() {
  const video = camera.video;
  if (!video.videoWidth) return;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  $('flash').style.opacity = '0.8';
  setTimeout(() => ($('flash').style.opacity = '0'), 90);
  canvas.toBlob(
    (blob) => {
      note(`Foto ${canvas.width}×${canvas.height}, ${Math.round(blob.size / 1024)} KB`);
      keep(blob, 'foto');
    },
    'image/jpeg',
    PHOTO_QUALITY,
  );
}

/* ---------- vídeo ---------- */
function showRecordingUi(on) {
  $('shot').classList.toggle('recording', on);
  $('timer').hidden = !on;
  clearInterval(timerTick);
  if (!on) return;
  $('timer').textContent = '00:00';
  timerTick = setInterval(() => {
    const s = Math.floor(elapsedMs() / 1000);
    $('timer').textContent =
      `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }, 500);
}

async function toggleRecording() {
  if (isRecording()) {
    stopRecording();
    showRecordingUi(false);
    setStatus('Ao vivo', 'ok');
    return;
  }
  const track = camera.track;
  if (!track) return;
  try {
    await startRecording(track, $('q').value === 'max', (blob) => keep(blob, 'video'));
    showRecordingUi(true);
    setStatus('Gravando', 'ok');
  } catch (e) {
    note(`Gravação: ${e.message}`);
    setStatus('Não consegui gravar', 'bad');
  }
}

hooks.isBusy = isRecording;
hooks.onTrackEnded = () => {
  if (isRecording()) {
    stopRecording();
    showRecordingUi(false);
  }
};

/* ---------- modo foto / vídeo ---------- */
function setMode(next) {
  if (isRecording()) return;
  mode = next;
  $('mFoto').classList.toggle('on', next === 'foto');
  $('mVideo').classList.toggle('on', next === 'video');
  $('shot').classList.toggle('video', next === 'video');
  $('shot').setAttribute('aria-label', next === 'foto' ? 'Tirar foto' : 'Gravar vídeo');
  prefs.set('modo', next);
}

/* ---------- diagnóstico ---------- */
function showDiagnostics() {
  const track = camera.track;
  const video = camera.video;
  const mime = pickMime();
  const stats = galleryStats();
  const lines = [
    `Câmeras encontradas: ${camera.devices.length}`,
    ...camera.devices.map(
      (d) => ` • ${d.label || '(sem nome)'}${d.deviceId === camera.current ? '  ← em uso' : ''}`,
    ),
    '',
    `Em uso: ${track ? `${track.label} | estado ${track.readyState}${track.muted ? ' | pausada' : ''}` : 'nenhuma'}`,
    `Resolução: ${video.videoWidth ? `${video.videoWidth}×${video.videoHeight}` : '-'}`,
    `Gravação de vídeo: ${mime === null ? 'não suportada' : mime || 'formato padrão'}`,
    `Offline: ${navigator.serviceWorker && navigator.serviceWorker.controller ? 'ativo' : 'ainda não (abra uma vez com internet)'}`,
    `Na galeria: ${stats.total} (${stats.pending} ainda não salvos no Fotos)`,
    '',
    'Para o iPhone parar de pedir permissão:',
    ' Ajustes → Apps → Safari → Câmera → Permitir',
    ' Ajustes → Apps → Safari → Microfone → Permitir',
    ' (iOS 17 ou anterior: Ajustes → Safari → Câmera)',
    '',
    'Registro:',
    ...newestFirst(),
  ];
  $('diag').textContent = lines.join('\n');
  $('diagSheet').hidden = false;
}

/* ---------- eventos ---------- */
$('chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (chip && !isRecording()) openLensAt(Number(chip.dataset.i));
});
$('zoom').addEventListener('input', (e) => setZoom(Number(e.target.value)));
$('zp').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (chip) setZoom(Number(chip.dataset.z));
});
$('q').addEventListener('change', () => {
  prefs.set('qual', $('q').value);
  if (camera.stream && !isRecording()) reopen();
});
$('startBtn').addEventListener('click', startCamera);
$('mFoto').addEventListener('click', () => setMode('foto'));
$('mVideo').addEventListener('click', () => setMode('video'));
$('shot').addEventListener('click', () => (mode === 'foto' ? takePhoto() : toggleRecording()));
$('diagBtn').addEventListener('click', showDiagnostics);
$('closeDiag').addEventListener('click', () => ($('diagSheet').hidden = true));
$('copyDiag').addEventListener('click', () =>
  navigator.clipboard.writeText($('diag').textContent).catch(() => {}),
);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (isRecording()) {
      stopRecording();
      showRecordingUi(false);
    }
    setTimeout(() => document.hidden && releaseMic(), 1500);
    return;
  }
  onVisible();
});

/* ---------- início ---------- */
const savedQuality = prefs.get('qual');
if (savedQuality && $('q').querySelector(`option[value="${savedQuality}"]`)) $('q').value = savedQuality;
if (prefs.get('modo') === 'video') setMode('video');
initGallery();
startCamera();
