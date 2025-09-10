import { writable } from 'svelte/store';

const { subscribe, set } = writable({
  isOpen: false,
  task: null,
});

export const taskModal = {
  subscribe,
  show: (task) => set({ isOpen: true, task }),
  hide: () => set({ isOpen: false, task: null }),
};