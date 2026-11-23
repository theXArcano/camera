/**
 * Registro em memória exibido na tela de Diagnóstico.
 * Guarda só as entradas mais recentes para não crescer sem limite.
 */
const MAX_ENTRIES = 200;
const entries = [];

export function note(message) {
  const time = new Date().toLocaleTimeString('pt-BR');
  entries.push(`${time}  ${message}`);
  if (entries.length > MAX_ENTRIES) entries.shift();
}

export function newestFirst() {
  return [...entries].reverse();
}
