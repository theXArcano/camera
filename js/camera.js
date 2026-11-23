/**
 * Câmera ao vivo: abre uma lente específica, religa quando o iOS corta a imagem
 * (temperatura, falha do módulo) e detecta quando a imagem fica preta.
 */
import { describeLens, sortLenses, zoomPresets, QUALITY, retryDelay } from './lenses.js';
import { note } from './log.js';
import { prefs } from './prefs.js';
import { $, setStatus, showMessage, hideMessage } from './ui.js';

const BLACK_LUMA = 4;
const BLACK_WARN_S = 3;
const BLACK_REOPEN_S = 12;

const video = $('v');
const probe = document.createElement('canvas');
probe.width = 32;
probe.height = 24;
const probeCtx = probe.getContext('2d', { willReadFrequently: true });

const state = {
  stream: null,
  devices: [],
  current: null,
  attempt: 0,
  retryTimer: 0,
  blackSince: 0,
  wanted: false,
  opening: false,
};

/** Ganchos preenchidos por main.js. */
export const hooks = {
  onTrackEnded: () => {},
  isBusy: () => false,
};

export const camera = {
  get stream() {
    return state.stream;
  },
  get track() {
    return state.stream ? state.stream.getVideoTracks()[0] : null;
  },
  get devices() {
    return state.devices;
  },
  get current() {
    return state.current;
  },
  get video() {
    return video;
  },
  quality() {
    return QUALITY[$('q').value] || QUALITY.max;
  },
};

function stop() {
  clearTimeout(state.retryTimer);
  if (state.stream) state.stream.getTracks().forEach((t) => t.stop());
  state.stream = null;
  video.srcObject = null;
}

async function listLenses() {
  const all = await navigator.mediaDevices.enumerateDevices();
  state.devices = sortLenses(all.filter((d) => d.kind === 'videoinput'));
  note(
    `Câmeras que o iOS informou: ${state.devices.map((d) => d.label || '(sem nome)').join(' | ') || 'nenhuma'}`,
  );
  $('chips').innerHTML = state.devices
    .map((d, i) => {
      const { short, long } = describeLens(d.label);
      const on = d.deviceId === state.current ? ' on' : '';
      return `<button class="chip${on}" data-i="${i}">${short}<small>${long}</small></button>`;
    })
    .join('');
}

function setupZoom(track) {
  const slider = $('zoom');
  const caps = track.getCapabilities ? track.getCapabilities() : {};
  if (!caps.zoom || caps.zoom.max <= caps.zoom.min) {
    slider.hidden = true;
    $('zp').hidden = true;
    return;
  }
  slider.min = caps.zoom.min;
  slider.max = Math.min(caps.zoom.max, 10);
  slider.value = track.getSettings().zoom || caps.zoom.min;
  slider.hidden = false;
  const presets = zoomPresets(track.label, caps.zoom.min, caps.zoom.max);
  $('zp').innerHTML = presets
    .map(([label, value]) => {
      const on = Math.abs(slider.value - value) < 0.05 ? ' on' : '';
      return `<button class="chip${on}" data-z="${value}">${label}<small>zoom digital</small></button>`;
    })
    .join('');
  $('zp').hidden = presets.length < 2;
}

export function setZoom(value) {
  const track = camera.track;
  if (!track) return;
  track.applyConstraints({ advanced: [{ zoom: value }] }).catch((e) => note(`zoom: ${e.message}`));
  $('zoom').value = value;
  $('zp')
    .querySelectorAll('.chip')
    .forEach((b) => b.classList.toggle('on', Math.abs(Number(b.dataset.z) - value) < 0.05));
}

function scheduleRetry() {
  $('shot').disabled = true;
  if (!$('auto').checked || !state.wanted) {
    showMessage(
      'Câmera parou',
      'O iPhone desligou a lente, provavelmente por temperatura. Espere esfriar um pouco ou troque de lente.',
    );
    return;
  }
  clearTimeout(state.retryTimer);
  const wait = retryDelay(state.attempt);
  state.attempt += 1;
  setStatus(`Religando em ${Math.round(wait / 1000)}s (tentativa ${state.attempt})`, 'wait');
  note(`Nova tentativa em ${wait}ms`);
  state.retryTimer = setTimeout(() => openLens(state.current), wait);
}

/** Abre a lente pedida (ou a traseira padrão, se deviceId for nulo). */
export async function openLens(deviceId) {
  if (state.opening) return;
  state.opening = true;
  hooks.onTrackEnded();
  stop();
  state.wanted = true;
  setStatus('Abrindo…', 'wait');
  $('shot').disabled = true;
  const constraints = deviceId
    ? { deviceId: { exact: deviceId }, ...camera.quality() }
    : { facingMode: { ideal: 'environment' }, ...camera.quality() };
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({ video: constraints, audio: false });
  } catch (e) {
    state.opening = false;
    note(`Falha ao abrir: ${e.name} ${e.message}`);
    if (e.name === 'NotAllowedError') {
      showMessage(
        'Toque para liberar a câmera',
        'Para o iPhone parar de perguntar: Ajustes → Apps → Safari → Câmera → Permitir.',
        'Abrir câmera',
      );
      setStatus('Aguardando permissão', 'wait');
      return;
    }
    if (e.name === 'OverconstrainedError' && deviceId) {
      prefs.set('lente', '');
      return openLens(null);
    }
    setStatus('Lente não abriu', 'bad');
    scheduleRetry();
    return;
  }
  state.opening = false;
  const track = state.stream.getVideoTracks()[0];
  state.current = track.getSettings().deviceId || deviceId;
  if (state.current) prefs.set('lente', state.current);
  note(`Aberta: ${track.label} ${JSON.stringify(track.getSettings())}`);
  track.addEventListener('ended', () => {
    note('iOS encerrou a câmera (ended)');
    hooks.onTrackEnded();
    if (document.hidden) return;
    setStatus('Cortada pelo iOS', 'bad');
    scheduleRetry();
  });
  track.addEventListener('mute', () => {
    note('Imagem pausada (mute)');
    setStatus('Imagem pausada', 'wait');
  });
  track.addEventListener('unmute', () => {
    note('Imagem voltou (unmute)');
    setStatus('Ao vivo', 'ok');
  });
  video.srcObject = state.stream;
  try {
    await video.play();
  } catch (e) {
    note(`play: ${e.message}`);
  }
  hideMessage();
  state.attempt = 0;
  state.blackSince = 0;
  await listLenses();
  setupZoom(track);
  setStatus('Ao vivo', 'ok');
  $('shot').disabled = false;
}

export async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showMessage('Navegador sem câmera', 'Abra este link no Safari, por um endereço https.');
    return;
  }
  state.attempt = 0;
  await openLens(prefs.get('lente') || null);
}

export function openLensAt(index) {
  const device = state.devices[index];
  if (!device) return;
  state.attempt = 0;
  openLens(device.deviceId);
}

export function reopen() {
  state.attempt = 0;
  openLens(state.current);
}

/** Mede o brilho médio a cada segundo para descobrir lente sem imagem. */
function watchBlack() {
  if (!state.stream || video.readyState < 2 || document.hidden) {
    $('res').hidden = true;
    return;
  }
  $('res').hidden = false;
  $('res').textContent = `${video.videoWidth}×${video.videoHeight}`;
  probeCtx.drawImage(video, 0, 0, 32, 24);
  const px = probeCtx.getImageData(0, 0, 32, 24).data;
  let sum = 0;
  for (let i = 0; i < px.length; i += 4) sum += px[i] + px[i + 1] + px[i + 2];
  const luma = sum / (px.length / 4) / 3;
  if (luma < BLACK_LUMA) {
    state.blackSince = state.blackSince || Date.now();
    const secs = (Date.now() - state.blackSince) / 1000;
    if (secs > BLACK_WARN_S)
      setStatus(`Imagem preta há ${Math.round(secs)}s (lente sem sinal ou tampada)`, 'bad');
    if (secs > BLACK_REOPEN_S && $('auto').checked && !hooks.isBusy()) {
      note('Preto por 12s, reabrindo');
      state.blackSince = 0;
      scheduleRetry();
    }
  } else if (state.blackSince) {
    state.blackSince = 0;
    setStatus(hooks.isBusy() ? 'Gravando' : 'Ao vivo', 'ok');
  }
}
setInterval(watchBlack, 1000);

/**
 * Ao minimizar NÃO desligamos a câmera: o iOS só pausa a imagem e devolve ao voltar,
 * sem pedir permissão de novo. Só reabrimos se o iOS de fato encerrou a câmera.
 */
export function onVisible() {
  if (!state.wanted) return;
  const track = camera.track;
  if (!track || track.readyState === 'ended') reopen();
  else video.play().catch(() => {});
}
