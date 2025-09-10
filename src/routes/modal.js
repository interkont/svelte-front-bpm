import { writable } from 'svelte/store';

// Estado inicial del store
const initialState = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

// Creamos un store 'writable'
const { subscribe, set, update } = writable(initialState);

// Creamos la lógica para interactuar con el store
export const modal = {
  subscribe,
  show: (config) => update(state => ({
    ...state,
    isOpen: true,
    title: config.title,
    message: config.message,
    onConfirm: config.onConfirm,
  })),
  hide: () => set(initialState),
};
