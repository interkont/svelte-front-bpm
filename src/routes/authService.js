// authService.js

// --- BASE DE DATOS SIMULADA ---
// En un futuro, esto será reemplazado por llamadas a tu API.
// Por ahora, simulamos un único usuario válido.
const mockUser = {
  id: 'usr_12345',
  name: 'Juan Pérez',
  email: 'juan.perez@empresa.com',
  role: 'Gerente de Proyectos',
  avatarUrl: 'https://placehold.co/128x128/EBF8FF/4299E1?text=JP'
};

/**
 * Simula la autenticación de un usuario contra un backend.
 * @param {string} email - El correo del usuario.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<object>} - Una promesa que resuelve con los datos del usuario si las credenciales son correctas.
 */
export const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    // Simulamos una pequeña demora de red
    setTimeout(() => {
      if (email === mockUser.email && password === 'password123') {
        // Credenciales correctas: devolvemos los datos del usuario
        resolve(mockUser);
      } else {
        // Credenciales incorrectas: rechazamos la promesa
        reject(new Error('Credenciales incorrectas. Inténtalo de nuevo.'));
      }
    }, 800);
  });
};
