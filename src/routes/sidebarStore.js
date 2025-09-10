import { writable } from 'svelte/store';

// Reemplazamos la importaci�n de SvelteKit con una comprobaci�n est�ndar de JavaScript.
const isBrowser = typeof window !== 'undefined';

const key = 'sidebarCollapsed';
const defaultValue = false;

// Obtener el valor inicial de localStorage si estamos en el navegador
const initialValue = isBrowser ? (localStorage.getItem(key) === 'true' || defaultValue) : defaultValue;

const { subscribe, set, update } = writable(initialValue);

export const sidebarStore = {
  subscribe,
  toggle: () => update(value => {
    const newValue = !value;
    if (isBrowser) {
      localStorage.setItem(key, newValue);
    }
    return newValue;
  }),
  set,
};
