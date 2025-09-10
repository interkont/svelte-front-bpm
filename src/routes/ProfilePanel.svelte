<script>
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { profilePanelStore } from './profilePanelStore.js';
  import Icon from './Icon.svelte';
  // --- MODIFICACIÓN: Importar el store de autenticación ---
  import { authStore } from './authStore.js';

  // --- MODIFICACIÓN: Los datos del usuario ahora vienen del store ---
  // El 'let user' local ya no es necesario, usaremos $authStore.user directamente
</script>

{#if $profilePanelStore && $authStore.user}
  <div class="panel-backdrop" on:click={() => profilePanelStore.set(false)}></div>
  
  <aside class="detail-panel profile-panel" transition:slide={{ duration: 400, easing: quintOut, axis: 'x' }}>
    <header class="panel-header">
      <div>
        <h2 class="header-title"><Icon name="user" size={28}/> Mi Perfil</h2>
        <p>Gestiona tu información personal y de seguridad.</p>
      </div>
      <button class="close-btn" on:click={() => profilePanelStore.set(false)} title="Cerrar panel">
        <Icon name="x" size={28}/>
      </button>
    </header>

    <div class="panel-content-full">
      <div class="profile-grid">
        <!-- Columna de Información Personal -->
        <div class="form-section">
          <h3>Información Personal</h3>
          <div class="avatar-section">
            <!-- MODIFICACIÓN: Usar datos del store -->
            <img src={$authStore.user.avatarUrl} alt="Avatar de {$authStore.user.name}" class="avatar-img"/>
            <div class="avatar-actions">
                <p>{$authStore.user.name}</p>
                <span>{$authStore.user.email}</span>
                <button class="upload-btn">
                    <Icon name="upload-cloud" size={16}/> Cambiar Foto
                </button>
            </div>
          </div>
          <div class="form-field">
            <label for="fullName">Nombre Completo</label>
            <!-- MODIFICACIÓN: Usar datos del store -->
            <input type="text" id="fullName" value={$authStore.user.name}>
          </div>
          <div class="form-field">
            <label for="email">Correo Electrónico</label>
            <!-- MODIFICACIÓN: Usar datos del store -->
            <input type="email" id="email" value={$authStore.user.email} disabled>
          </div>
        </div>

        <!-- Columna de Seguridad -->
        <div class="form-section">
          <h3>Seguridad y Contraseña</h3>
           <div class="form-field">
            <label for="currentPassword">Contraseña Actual</label>
            <input type="password" id="currentPassword" placeholder="""""""""">
          </div>
           <div class="form-field">
            <label for="newPassword">Nueva Contraseña</label>
            <input type="password" id="newPassword" placeholder="Mínimo 8 caracteres">
          </div>
           <div class="form-field">
            <label for="confirmPassword">Confirmar Nueva Contraseña</label>
            <input type="password" id="confirmPassword" placeholder="Repite la nueva contraseña">
          </div>
        </div>
      </div>
    </div>
    <footer class="panel-footer">
        <!-- --- NUEVO: Botón de Cerrar Sesión --- -->
        <button class="logout-btn" on:click={authStore.logout}>
            <Icon name="log-out" size={16}/>
            Cerrar Sesión
        </button>
        <div class="actions-right">
            <button class="cancel-btn" on:click={() => profilePanelStore.set(false)}>Cancelar</button>
            <button class="submit-btn">Guardar Cambios</button>
        </div>
    </footer>
  </aside>
{/if}

<style>
/* Estilos generales del panel */
.panel-backdrop {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1200;
}
.profile-panel {
  width: 50vw; max-width: 800px;
  background-color: var(--bg-secondary);
  z-index: 1201;
  position: fixed; top: 0; right: 0; height: 100vh;
  box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.header-title { display: flex; align-items: center; gap: 1rem; margin: 0; }
.panel-header p { margin: 0.25rem 0 0 0; color: var(--text-secondary); }
.close-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.5rem; }

.panel-content-full { flex-grow: 1; overflow-y: auto; padding: 2rem; }
.profile-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .profile-grid { grid-template-columns: 1fr 1fr; } }

.form-section h3 {
    font-size: 1.25rem;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1rem;
    margin: 0 0 1.5rem 0;
}

.avatar-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background-color: var(--bg-primary);
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
}
.avatar-img { width: 80px; height: 80px; border-radius: 50%; }
.avatar-actions p { margin: 0; font-weight: 600; font-size: 1.1rem; }
.avatar-actions span { font-size: 0.9rem; color: var(--text-secondary); }
.upload-btn {
    display: flex; align-items: center; gap: 0.5rem;
    background: none; border: 1px solid var(--border-color); color: var(--text-primary);
    padding: 0.5rem 1rem; border-radius: 6px; margin-top: 0.5rem; cursor: pointer;
}

.form-field { margin-bottom: 1.5rem; }
.form-field label { display: block; font-weight: 500; color: var(--text-primary); margin-bottom: 0.5rem; }
.form-field input {
  width: 100%; padding: 0.75rem; border: 1px solid var(--border-color);
  background-color: var(--bg-secondary); color: var(--text-primary);
  border-radius: 8px; font-size: 1rem; box-sizing: border-box;
}
.form-field input:disabled { background-color: var(--bg-hover); color: var(--text-secondary); }

/* --- MODIFICACIÓN: Estilos para el footer --- */
.panel-footer {
  flex-shrink: 0; display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 2rem; border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}
.actions-right {
    display: flex;
    gap: 1rem;
}
button { cursor: pointer; font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid transparent; display: flex; align-items: center; gap: 0.5rem; }
.cancel-btn { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); }
.submit-btn { background-color: var(--accent-color); color: white; }
/* --- NUEVO: Estilo para el botón de logout --- */
.logout-btn {
    background-color: #f5656520;
    color: #c53030;
    border-color: transparent;
}
.logout-btn:hover {
    background-color: #f5656540;
}
</style>
