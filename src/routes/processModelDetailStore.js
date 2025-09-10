import { writable } from 'svelte/store';

const initialState = {
  isOpen: false,
  model: null,
};

const { subscribe, set } = writable(initialState);

export const processModelDetailStore = {
  subscribe,
  show: (modelData) => set({ isOpen: true, model: modelData }),
  hide: () => set(initialState),
};