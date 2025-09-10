<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let container;
  let propertiesContainer;
  let modeler;

  onMount(async () => {
    // Importar modeler completo (igual que tu código original)
    const { default: Modeler } = await import(
      'https://unpkg.com/bpmn-js@11.5.0/dist/bpmn-modeler.production.min.js'
    );

    // Importar paquete de properties panel (UMD)
    const propsPanelPkg = await import(
      'https://unpkg.com/bpmn-js-properties-panel@5.42.0/dist/bpmn-js-properties-panel.umd.js'
    );

    // Extraer módulos correctos (igual que antes)
    const { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } = propsPanelPkg;

    modeler = new Modeler({
      container,
      propertiesPanel: { parent: propertiesContainer },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule
      ],
      keyboard: { bindTo: document }
    });

    // XML de proceso existente (ejemplo con nombres y conexiones)
    const diagramXML = `<?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                      xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                      xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                      xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                      id="Definitions_1"
                      targetNamespace="http://bpmn.io/schema/bpmn">
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:startEvent id="StartEvent_1" name="Inicio">
          <bpmn:outgoing>Flow_1</bpmn:outgoing>
        </bpmn:startEvent>
        <bpmn:task id="Task_1" name="Revisar Solicitud">
          <bpmn:incoming>Flow_1</bpmn:incoming>
          <bpmn:outgoing>Flow_2</bpmn:outgoing>
        </bpmn:task>
        <bpmn:endEvent id="EndEvent_1" name="Fin">
          <bpmn:incoming>Flow_2</bpmn:incoming>
        </bpmn:endEvent>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>
        <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1"/>
      </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
            <dc:Bounds x="150" y="100" width="36" height="36"/>
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
            <dc:Bounds x="250" y="80" width="100" height="80"/>
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
            <dc:Bounds x="420" y="100" width="36" height="36"/>
          </bpmndi:BPMNShape>
          <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
            <di:waypoint x="186" y="118"/>
            <di:waypoint x="250" y="118"/>
          </bpmndi:BPMNEdge>
          <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
            <di:waypoint x="350" y="118"/>
            <di:waypoint x="420" y="118"/>
          </bpmndi:BPMNEdge>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>`;

    try {
      await modeler.importXML(diagramXML);
      modeler.get('canvas').zoom('fit-viewport');
      console.log("Diagrama cargado con propiedades activas");
    } catch (err) {
      console.error("Error cargando diagrama:", err);
    }
  });

  // Función para guardar el diagrama y emitir evento al padre
  async function saveDiagram() {
    if (!modeler) return;
    try {
      const { xml } = await modeler.saveXML({ format: true });
      // Emitir evento con el XML (el padre decide qué hacer)
      dispatch('save', { xml });

      // Opcional: destruir instancia para liberar memoria (el padre puede re-montar)
      try { modeler.destroy(); } catch (_) {}
      modeler = null;
    } catch (err) {
      console.error('Error guardando diagrama:', err);
      // Puedes dispatch un evento 'error' si quieres manejarlo en el padre
      dispatch('error', { error: err });
    }
  }

  // Función para cancelar (emitir evento y destruir modeler)
  function cancel() {
    try { if (modeler) { modeler.destroy(); modeler = null; } } catch (_) {}
    dispatch('cancel');
  }

  onDestroy(() => {
    try { if (modeler) modeler.destroy(); } catch (_) {}
    modeler = null;
  });
</script>

<!-- CSS necesarios -->
<link rel="stylesheet" href="https://unpkg.com/bpmn-js@11.5.0/dist/assets/diagram-js.css">
<link rel="stylesheet" href="https://unpkg.com/bpmn-js@11.5.0/dist/assets/bpmn-font/css/bpmn-embedded.css">
<link rel="stylesheet" href="https://unpkg.com/@bpmn-io/properties-panel@3.33.0/dist/assets/properties-panel.css"/>

<!-- Toolbar: botones Guardar / Cancelar -->
<div class="toolbar">
  <button class="save-btn" on:click={saveDiagram}>= Guardar</button>
  <button class="cancel-btn" on:click={cancel}> Cancelar</button>
</div>

<div class="bpmn-container">
  <div bind:this={container} class="diagram"></div>
  <div bind:this={propertiesContainer} class="properties"></div>
</div>

<style>
  .toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }
  .save-btn, .cancel-btn {
    padding: 0.5rem 0.9rem;
    border-radius: 6px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    font-weight: 600;
  }
  .save-btn { background: var(--accent-color); color: white; border-color: rgba(0,0,0,0.05); }
  .cancel-btn { background: #fff; color: #333; }

  .bpmn-container {
    display: flex;
    width: 100%;
    height: 800px;
    border: 1px solid #ccc;
  }
  .diagram { flex: 3; }
  .properties {
    flex: 1;
    border-left: 1px solid #ccc;
    background: #f9f9f9;
    overflow-y: auto;
  }
</style>
