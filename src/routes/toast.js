import { writable } from 'svelte/store';

const { subscribe, update } = writable([]);

// Funci�n para a�adir una notificaci�n a la lista
function addToast(toast) {
    // Generamos un ID �nico para la notificaci�n
    const id = Date.now() + Math.random();
    
    // A�adimos la nueva notificaci�n al array
    update(toasts => [...toasts, { id, ...toast }]);
    
    // Creamos un temporizador para eliminarla despu�s de un tiempo
    setTimeout(() => removeToast(id), toast.duration || 4000);
}

// Funci�n para eliminar una notificaci�n por su ID
function removeToast(id) {
    update(toasts => toasts.filter(t => t.id !== id));
}

// Exportamos un objeto que nuestra app puede usar
export const toast = {
    subscribe,
    show: (message, type = 'success') => addToast({ message, type }),
};
