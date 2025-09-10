import { writable } from 'svelte/store';

const { subscribe, update } = writable([]);

// Función para añadir una notificación a la lista
function addToast(toast) {
    // Generamos un ID único para la notificación
    const id = Date.now() + Math.random();
    
    // Añadimos la nueva notificación al array
    update(toasts => [...toasts, { id, ...toast }]);
    
    // Creamos un temporizador para eliminarla después de un tiempo
    setTimeout(() => removeToast(id), toast.duration || 4000);
}

// Función para eliminar una notificación por su ID
function removeToast(id) {
    update(toasts => toasts.filter(t => t.id !== id));
}

// Exportamos un objeto que nuestra app puede usar
export const toast = {
    subscribe,
    show: (message, type = 'success') => addToast({ message, type }),
};
