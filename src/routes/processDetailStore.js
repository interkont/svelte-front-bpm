import { writable } from 'svelte/store';

const initialState = {
  isOpen: false,
  process: null,
};

const { subscribe, set } = writable(initialState);

export const processDetailStore = {
  subscribe,
  show: (processData) => set({ isOpen: true, process: processData }),
  hide: () => set(initialState),
};
