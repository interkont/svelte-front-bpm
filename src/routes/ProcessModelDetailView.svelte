<script>
  import { onDestroy, tick } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { processModelDetailStore } from './processModelDetailStore.js';
  import Icon from './Icon.svelte';
  import { toast } from './toast.js';

  export let model;

  let canvas;
  let propertiesContainer;
  let bpmnViewer = null;
  let bpmnModeler = null;
  let isLoading = false;
  let isViewerInitialized = false;
  let isEditing = false;

  // Caches para evitar re-imports
  let ViewerModule = null;
  let ModelerModule = null;
  let propsPanelPkg = null;

  processModelDetailStore.subscribe((store) => {
    console.log('[Store Update] El store ha cambiado. Modelo actual:', store.model?.id);
  });

  // Inicializa solo el VIEWER (modo consulta)
  async function initializeViewer() {
    if (!canvas) {
      console.warn('[initializeViewer] canvas no disponible aún');
      return;
    }
    if (isViewerInitialized) return;
    isLoading = true;
    try {
      if (!ViewerModule) {
        // Import dinámico del viewer (misma familia de versión que el modeler)
        const mod = await import('https://unpkg.com/bpmn-js@11.5.0/dist/bpmn-viewer.production.min.js');
        ViewerModule = mod.default || mod;
      }

      // Asegurarse de destruir cualquier modeler previo
      if (bpmnModeler) {
        try { bpmnModeler.destroy(); } catch (e) { console.warn(e); }
        bpmnModeler = null;
      }

      bpmnViewer = new ViewerModule({
        container: canvas,
        height: '100%',
        width: '100%'
      });

      if (model?.bpmnXml) {
        await bpmnViewer.importXML(model.bpmnXml);
        // fit-viewport acepta algunas variantes; uso seguro:
        bpmnViewer.get('canvas').zoom('fit-viewport');
      }

      isViewerInitialized = true;
      console.log('[initializeViewer] Viewer inicializado');
    } catch (err) {
      console.error('[initializeViewer] Error al inicializar Viewer:', err);
      toast.show('Error al mostrar el diagrama.', 'error');
    } finally {
      isLoading = false;
    }
  }

  // Habilita el modo edición (Modeler)  solo se crea cuando el usuario lo pide
  async function enableEditing() {
    if (!model) return;
    isLoading = true;
    try {
      // Cargar modeler y properties panel (cacheados)
      if (!ModelerModule) {
        const mod = await import('https://unpkg.com/bpmn-js@11.5.0/dist/bpmn-modeler.production.min.js');
        ModelerModule = mod.default || mod;
      }

      if (!propsPanelPkg) {
        propsPanelPkg = await import('https://unpkg.com/bpmn-js-properties-panel@5.42.0/dist/bpmn-js-properties-panel.umd.js');
      }

      const { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } = propsPanelPkg;

      // destruir viewer si existe
      if (bpmnViewer) {
        try { bpmnViewer.destroy(); } catch (e) { console.warn(e); }
        bpmnViewer = null;
      }

      // Mostrar contenedor de properties en el DOM antes de crear el modeler
      isEditing = true;
      await tick(); // importante: esperar a que propertiesContainer esté en el DOM

      bpmnModeler = new ModelerModule({
        container: canvas,
        propertiesPanel: { parent: propertiesContainer },
        additionalModules: [BpmnPropertiesPanelModule, BpmnPropertiesProviderModule],
        keyboard: { bindTo: document }
      });

      if (model.bpmnXml) {
        await bpmnModeler.importXML(model.bpmnXml);
        bpmnModeler.get('canvas').zoom('fit-viewport');
      }

      // Para depuración: escuchar cambios de selección y ver si el modeler emite eventos
      try {
        const eventBus = bpmnModeler.get('eventBus');
        eventBus.on('selection.changed', (e) => {
          console.log('[bpmnModeler] selection.changed', e);
        });
      } catch (e) {
        console.warn('[enableEditing] no fue posible adjuntar selection.changed', e);
      }

      console.log('[enableEditing] Modo edición activado (Modeler + Properties Panel + Paleta)');
    } catch (err) {
      console.error('[enableEditing] Error al activar modo edición', err);
      toast.show('No se pudo activar el modo edición.', 'error');
      // Si falla, intentar volver al viewer
      isEditing = false;
      await tick();
      initializeViewer();
    } finally {
      isLoading = false;
    }
  }

  async function saveChanges() {
    if (!bpmnModeler) return;
    isLoading = true;
    try {
      const { xml } = await bpmnModeler.saveXML({ format: true });
      model.bpmnXml = xml;
      toast.show('Cambios guardados exitosamente.', 'success');
    } catch (err) {
      console.error('Error al guardar cambios', err);
      toast.show('Error al guardar cambios.', 'error');
    } finally {
      if (bpmnModeler) {
        try { bpmnModeler.destroy(); } catch (e) { console.warn(e); }
        bpmnModeler = null;
      }
      isEditing = false;
      isViewerInitialized = false;
      await tick();
      await initializeViewer();
      isLoading = false;
    }
  }

  async function cancelEditing() {
    if (bpmnModeler) {
      try { bpmnModeler.destroy(); } catch (e) { console.warn(e); }
      bpmnModeler = null;
    }
    isEditing = false;
    isViewerInitialized = false;
    await tick();
    await initializeViewer();
    toast.show('Edición cancelada, no se guardaron cambios.', 'info');
  }

  function handleIntroEnd() {
    // Iniciar viewer cuando termine la animación/intro
    if (canvas && model && !isViewerInitialized && !isEditing) {
      initializeViewer();
    }
  }

  onDestroy(() => {
    if (bpmnViewer) {
      try { bpmnViewer.destroy(); } catch (_) {}
    }
    if (bpmnModeler) {
      try { bpmnModeler.destroy(); } catch (_) {}
    }
    bpmnViewer = null;
    bpmnModeler = null;
  });
</script>

<!-- CSS externos necesarios (mantenerlos) -->
<link rel="stylesheet" href="https://unpkg.com/bpmn-js@11.5.0/dist/assets/diagram-js.css">
<link rel="stylesheet" href="https://unpkg.com/bpmn-js@11.5.0/dist/assets/bpmn-font/css/bpmn-embedded.css">
<link rel="stylesheet" href="https://unpkg.com/@bpmn-io/properties-panel@3.33.0/dist/assets/properties-panel.css"/>

<div 
  class="panel-backdrop" 
  on:click={processModelDetailStore.hide}
  on:keydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') processModelDetailStore.hide() }}
  role="button"
  tabindex="0"
  aria-label="Cerrar panel de detalle"
></div>

<aside 
  class="detail-panel" 
  transition:slide={{ duration: 400, easing: quintOut, axis: 'x' }}
  on:introend={handleIntroEnd}
>
  <header class="panel-header">
    <div>
      <span class="header-subtitle">Modelo de Proceso</span>
      <h2 title={model?.name}>{model?.name}</h2>
      <p>ID: {model?.id} | Versión: {model?.version}</p>
    </div>
    <div class="header-actions">
      {#if isEditing}
        <button class="action-btn" on:click={saveChanges}><Icon name="save" size={18}/> Guardar</button>
        <button class="action-btn" on:click={cancelEditing}><Icon name="x" size={18}/> Cancelar</button>
      {:else}
        <button class="action-btn" on:click={enableEditing}><Icon name="edit" size={18}/> Editar</button>
      {/if}
      <button class="action-btn close-btn" on:click={processModelDetailStore.hide} title="Cerrar panel">
        <Icon name="x" size={28}/>
      </button>
    </div>
  </header>

  <div class="panel-content">
    {#if isLoading}
      <div class="loading-overlay">
        <Icon name="loader" size={48} class="spinner"/>
        <span>Cargando Diagrama...</span>
      </div>
    {/if}
    <div class="bpmn-container">
      <div bind:this={canvas} class="diagram"></div>
      {#if isEditing}
        <div bind:this={propertiesContainer} class="properties"></div>
      {/if}
    </div>
  </div>
</aside>

<style>
  .panel-backdrop {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1050;
    cursor: pointer;
  }
  .detail-panel {
    position: fixed; top: 0; right: 0;
    width: 90vw;
    max-width: 1600px;
    height: 100vh;
    background-color: var(--bg-primary);
    box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
    z-index: 1051;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }
  .header-subtitle {
    font-size: 0.9rem;
    color: var(--accent-color);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .panel-header h2 { margin: 0.25rem 0; color: var(--text-primary); font-size: 1.75rem; }
  .panel-header p { margin: 0; color: var(--text-secondary); }
  .header-actions { display: flex; align-items: center; gap: 1rem; }
  .action-btn {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .close-btn {
    border: none;
    padding: 0.5rem;
  }
  .close-btn:hover { background-color: var(--bg-hover); }

  .panel-content {
    flex-grow: 1;
    overflow: hidden;
    position: relative;
  }

  .bpmn-container {
    display: flex;
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
  }
  .diagram { flex: 3; }
  .properties {
    flex: 1;
    border-left: 1px solid #ccc;
    background: #f9f9f9;
    overflow-y: auto;
  }

  .loading-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    color: var(--text-primary);
  }
  :global(body.dark) .loading-overlay {
    background-color: rgba(31, 41, 55, 0.8);
  }
  .loading-overlay span {
    margin-top: 1rem;
    font-weight: 500;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  :global(.spinner) {
    animation: spin 1s linear infinite;
    color: var(--accent-color);
  }

  :global(.djs-visual > rects) {
    fill: #e0e7ff !important;
    stroke: var(--accent-color) !important;
    stroke-width: 2px !important;
  }
  :global( .djs-visual > path) {
    stroke: var(--text-secondary) !important;
    stroke-width: 0.1rem !important;
  }
  :global(.djs-label) {
    font-family: 'Inter', sans-serif !important;
    fill: var(--text-primary) !important;
    font-weight: 600 !important;
  }
  :global(.djs-element.djs-shape[data-element-id^="StartEvent_"] > .djs-visual > circle) {
    fill: #e6fffa !important;
    stroke: var(--success-color) !important;
    stroke-width: 2.5px !important;
  }
  :global(.djs-visual > circle) {
    fill: #fff5f5 !important;
    stroke: #c53030 !important;
    stroke-width: 3px !important;
  }
  :global(.djs-visual > rect) {
    fill: var(--bg-primary) !important;
    stroke: var(--text-secondary) !important;
    stroke-width: 2px !important;
  }
  :global(.djs-visual > polygon) {
    fill: #fffbeb !important;
    stroke: #d69e2e !important;
    stroke-width: 2.5px !important;
  }
  :global(.djs-connection-outline, .djs-outline) {
    stroke: transparent !important;
  }
  :global(.djs-hit) {
    stroke: none !important;
    fill: transparent !important;
  }
</style>
