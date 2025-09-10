// authStore.js
import { writable } from 'svelte/store';
import { authenticateUser } from './authService.js';

// --- Estado Inicial ---
const initialState = {
  isAuthenticated: false,
  user: null,
  error: null,
  loading: false,
};

function createAuthStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    
    // --- Acción de Login ---
    login: async (email, password) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const userData = await authenticateUser(email, password);
        // Guardamos el usuario en sessionStorage para persistir la sesión
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
        set({ isAuthenticated: true, user: userData, error: null, loading: false });
      } catch (err) {
        set({ isAuthenticated: false, user: null, error: err.message, loading: false });
        // Lanzamos el error para que el componente de UI pueda reaccionar
        throw err;
      }
    },

    // --- Acción de Logout ---
    logout: () => {
      // Limpiamos sessionStorage y reseteamos el store
      if (typeof window !== 'undefined') {
          sessionStorage.removeItem('user');
      }
      set(initialState);
    },
    
    // --- Inicializador ---
    // Comprueba si ya existe una sesión en sessionStorage al cargar la app
    init: () => {
        if (typeof window !== 'undefined') {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                set({
                    isAuthenticated: true,
                    user: JSON.parse(storedUser),
                    error: null,
                    loading: false
                });
            }
        }
    }
  };
}

export const authStore = createAuthStore();
