// authService.js

// --- BASE DE DATOS SIMULADA ---
// En un futuro, esto ser� reemplazado por llamadas a tu API.
// Por ahora, simulamos un �nico usuario v�lido.
const mockUser = {
  id: 'usr_12345',
  name: 'Juan P�rez',
  email: 'juan.perez@empresa.com',
  role: 'Gerente de Proyectos',
  avatarUrl: 'https://placehold.co/128x128/EBF8FF/4299E1?text=JP'
};

/**
 * Simula la autenticaci�n de un usuario contra un backend.
 * @param {string} email - El correo del usuario.
 * @param {string} password - La contrase�a del usuario.
 * @returns {Promise<object>} - Una promesa que resuelve con los datos del usuario si las credenciales son correctas.
 */
export const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    // Simulamos una peque�a demora de red
    setTimeout(() => {
      if (email === mockUser.email && password === 'password123') {
        // Credenciales correctas: devolvemos los datos del usuario
        resolve(mockUser);
      } else {
        // Credenciales incorrectas: rechazamos la promesa
        reject(new Error('Credenciales incorrectas. Int�ntalo de nuevo.'));
      }
    }, 800);
  });
};
