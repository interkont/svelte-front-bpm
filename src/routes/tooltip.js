/**
 * Svelte Action: Muestra un tooltip cuando el usuario pasa el mouse sobre un elemento.
 * @param {HTMLElement} node - El elemento HTML al que se aplica la acción.
 * @param {string} text - El texto que se mostrará en el tooltip.
 */
export function tooltip(node, text) {
  let tooltipElement;

  function mouseOver() {
    // Creamos el div del tooltip
    tooltipElement = document.createElement('div');
    tooltipElement.textContent = text;
    
    // Estilos del tooltip
    Object.assign(tooltipElement.style, {
      position: 'absolute',
      backgroundColor: '#2d3748',
      color: 'white',
      padding: '0.5rem 0.75rem',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '500',
      zIndex: '100',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      opacity: '0',
      transition: 'opacity 0.2s'
    });

    document.body.appendChild(tooltipElement);

    // Posicionamos el tooltip
    const nodeRect = node.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    
    tooltipElement.style.top = `${nodeRect.top - tooltipRect.height - 8}px`;
    tooltipElement.style.left = `${nodeRect.left + (nodeRect.width / 2) - (tooltipRect.width / 2)}px`;

    // Hacemos que aparezca suavemente
    requestAnimationFrame(() => {
        tooltipElement.style.opacity = '1';
    });
  }

  function mouseLeave() {
    if (tooltipElement) {
      tooltipElement.remove();
      tooltipElement = null;
    }
  }

  // Añadimos los listeners al elemento
  node.addEventListener('mouseover', mouseOver);
  node.addEventListener('mouseleave', mouseLeave);

  return {
    // Función destroy: se ejecuta cuando el componente se desmonta
    destroy() {
      node.removeEventListener('mouseover', mouseOver);
      node.removeEventListener('mouseleave', mouseLeave);
    }
  };
}

