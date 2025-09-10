import { writable } from 'svelte/store';

const initialState = {
  isOpen: false,
  task: null,
};

const { subscribe, set } = writable(initialState);

export const taskDetailStore = {
  subscribe,
  show: (task) => set({ isOpen: true, task }),
  hide: () => set(initialState),
};