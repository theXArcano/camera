/**
 * Preferências pequenas do usuário (lente, qualidade, modo).
 * O localStorage pode lançar erro em modo privado; nesse caso o app segue sem lembrar.
 */
export const prefs = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* sem armazenamento: ignora */
    }
  },
};
