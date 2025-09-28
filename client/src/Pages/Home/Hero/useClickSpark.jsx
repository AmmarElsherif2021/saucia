import { useEffect, useRef, useCallback } from 'react';

// Click Spark Web Component
const defineClickSparkElement = () => {
  if (customElements.get('click-spark')) return;

  class ClickSpark extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.shadowRoot.innerHTML = this.createSpark();
      this.svg = this.shadowRoot.querySelector("svg");
      this._parent = this.parentNode;
      this._parent.addEventListener("click", this);
    }

    disconnectedCallback() {
      this._parent.removeEventListener("click", this);
      delete this._parent;
    }

    handleEvent(e) {
      this.setSparkPosition(e);
      this.animateSpark();
    }

    animateSpark() {
      let sparks = [...this.svg.children];
      let size = parseInt(sparks[0].getAttribute("y1"));
      let offset = size / 2 + "px";

      let keyframes = (i) => {
        let deg = `calc(${i} * (360deg / ${sparks.length}))`;

        return [
          {
            strokeDashoffset: size * 3,
            transform: `rotate(${deg}) translateY(${offset})`,
          },
          {
            strokeDashoffset: size,
            transform: `rotate(${deg}) translateY(0)`,
          },
        ];
      };

      let options = {
        duration: 1000,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        fill: "forwards",
      };

      sparks.forEach((spark, i) => spark.animate(keyframes(i), options));
    }

    // Simplified positioning calculation for better mobile support
    setSparkPosition(e) {
      const rect = this.parentNode.getBoundingClientRect();
      
      // Handle both touch and mouse events
      let clientX, clientY;
      
      if (e.touches && e.touches.length > 0) {
        // Touch event - use the first touch point
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        // Touch end event - use changedTouches
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      // Simple calculation without complex viewport scaling
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      // Center the spark on the click/touch position with consistent size
      const sparkSize = 150; // consistent size
      
      this.style.left = (x - sparkSize / 2) + "px";
      this.style.top = (y - sparkSize / 2) + "px";
    }

    createSpark() {
      return `
        <style>
          :host {
            position: absolute;
            pointer-events: none;
            z-index: 1000;
          }
        </style>
        <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" stroke="var(--click-spark-color, #166f44)" transform="rotate(-20)">
          ${Array.from(
            { length: 8 },
            (_) =>
              `<line x1="50" y1="30" x2="50" y2="4" stroke-dasharray="30" stroke-dashoffset="30" style="transform-origin: center" />`
          ).join("")}
        </svg>
      `;
    }
  }

  customElements.define("click-spark", ClickSpark);
};

// Custom hook for spark functionality
export const useClickSpark = () => {
  const sparkElementsRef = useRef(new Set());

  useEffect(() => {
    defineClickSparkElement();
  }, []);

  // Better event handling for mobile
  const createSpark = useCallback((event, container) => {
    if (!container) return;

    const spark = document.createElement('click-spark');
    spark.style.setProperty('--click-spark-color', '#97e861ff');
    
    container.appendChild(spark);
    sparkElementsRef.current.add(spark);

    // For mobile devices, ensure the event has the right coordinates
    let adjustedEvent = event;
    
    // If it's a touch event, create a more compatible event object
    if (event.changedTouches && event.changedTouches.length > 0) {
      adjustedEvent = {
        ...event,
        clientX: event.changedTouches[0].clientX,
        clientY: event.changedTouches[0].clientY,
        touches: event.changedTouches
      };
    }

    // Trigger the spark animation
    setTimeout(() => {
      if (spark.handleEvent) {
        spark.handleEvent(adjustedEvent);
      }
    }, 20);

    // Remove spark after animation completes
    setTimeout(() => {
      if (spark.parentNode) {
        spark.parentNode.removeChild(spark);
      }
      sparkElementsRef.current.delete(spark);
    }, 700);

    return spark;
  }, []);

  const cleanupSparks = useCallback(() => {
    sparkElementsRef.current.forEach(spark => {
      if (spark.parentNode) {
        spark.parentNode.removeChild(spark);
      }
    });
    sparkElementsRef.current.clear();
  }, []);

  return { createSpark, cleanupSparks };
};

export default useClickSpark;