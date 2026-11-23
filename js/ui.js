/** Pequenos utilitários de interface compartilhados pelos módulos. */

export const $ = (id) => document.getElementById(id);

export function setStatus(text, kind = '') {
  $('status').textContent = text;
  $('dot').className = `dot ${kind}`;
}

let toastTimer = 0;
export function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

export function showMessage(title, body, button = 'Tentar de novo') {
  const box = $('msg');
  box.hidden = false;
  box.querySelector('b').textContent = title;
  box.querySelector('p').textContent = body;
  $('startBtn').textContent = button;
}

export function hideMessage() {
  $('msg').hidden = true;
}

/**
 * Folha de confirmação no estilo do iOS (botão vermelho + Cancelar).
 * @returns {Promise<boolean>}
 */
export function confirmSheet(text, action) {
  return new Promise((resolve) => {
    const sheet = $('confirm');
    $('cText').textContent = text;
    $('cYes').textContent = action;
    sheet.hidden = false;
    const done = (answer) => {
      sheet.hidden = true;
      $('cYes').onclick = null;
      $('cNo').onclick = null;
      sheet.onclick = null;
      resolve(answer);
    };
    $('cYes').onclick = () => done(true);
    $('cNo').onclick = () => done(false);
    sheet.onclick = (e) => {
      if (e.target === sheet) done(false);
    };
  });
}

/** "1 item" / "3 itens", "1 foto" / "2 fotos"... */
export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}
