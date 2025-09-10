import { writable } from 'svelte/store';

// Funci�n para inicializar la tienda
function createThemeStore() {
  const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light';
  
  const { subscribe, set, update } = writable(storedTheme);

  return {
    subscribe,
    // Funci�n para cambiar de tema
    toggle: () => {
      update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', newTheme);
          // --- MODIFICACI�N CLAVE: Aplicar la clase al elemento <html> ---
          const root = document.documentElement;
          if (newTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
        return newTheme;
      });
    },
    // Funci�n para inicializar el tema al cargar la app
    init: () => {
       if (typeof window !== 'undefined') {
          const initialTheme = localStorage.getItem('theme') || 'light';
          // --- MODIFICACI�N CLAVE: Aplicar la clase al elemento <html> ---
          const root = document.documentElement;
           if (initialTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
          set(initialTheme);
       }
    }
  };
}

export const theme = createThemeStore();
