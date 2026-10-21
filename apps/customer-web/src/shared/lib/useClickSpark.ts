import { useCallback, useEffect, useRef } from 'react';

const SPARK_COLOR = '#97e861';
const SPARK_SIZE = 150;
const SPARK_LIFETIME = 1000;
const SPARK_COUNT = 8;

export interface SparkPoint {
  clientX: number;
  clientY: number;
}

/**
 * Click spark — a short radial burst at the pointer.
 *
 * Framework-level decoration with no business knowledge, so it lives in
 * `shared/lib`. (The v1 implementation wrapped this in a custom element; the
 * visual result is the same with a plain node and the Web Animations API.)
 */
export function useClickSpark() {
  const sparksRef = useRef<Set<HTMLDivElement>>(new Set());

  useEffect(() => {
    const sparks = sparksRef.current;
    return () => {
      sparks.forEach((spark) => spark.remove());
      sparks.clear();
    };
  }, []);

  const cleanupSparks = useCallback(() => {
    sparksRef.current.forEach((spark) => spark.remove());
    sparksRef.current.clear();
  }, []);

  const createSpark = useCallback(
    (point: SparkPoint, container: HTMLElement | null) => {
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      const host = document.createElement('div');
      host.style.cssText = [
        'position:absolute',
        'pointer-events:none',
        'z-index:1000',
        `left:${point.clientX - rect.left - SPARK_SIZE / 2}px`,
        `top:${point.clientY - rect.top - SPARK_SIZE / 2}px`,
        `width:${SPARK_SIZE}px`,
        `height:${SPARK_SIZE}px`,
      ].join(';');

      const lines = Array.from({ length: SPARK_COUNT }, () => {
        return `<line x1="50" y1="30" x2="50" y2="4" stroke="${SPARK_COLOR}" stroke-width="4" stroke-linecap="round" stroke-dasharray="30" stroke-dashoffset="30" style="transform-origin:center" />`;
      }).join('');

      host.innerHTML = `<svg width="${SPARK_SIZE}" height="${SPARK_SIZE}" viewBox="0 0 100 100" fill="none" transform="rotate(-20)">${lines}</svg>`;
      container.appendChild(host);
      sparksRef.current.add(host);

      host.querySelectorAll('line').forEach((line, index) => {
        const angle = `${index * (360 / SPARK_COUNT)}deg`;
        line.animate(
          [
            { strokeDashoffset: 90, transform: `rotate(${angle}) translateY(75px)` },
            { strokeDashoffset: 30, transform: `rotate(${angle}) translateY(0)` },
          ],
          {
            duration: SPARK_LIFETIME,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            fill: 'forwards',
          },
        );
      });

      window.setTimeout(() => {
        host.remove();
        sparksRef.current.delete(host);
      }, SPARK_LIFETIME);

      return host;
    },
    [],
  );

  return { createSpark, cleanupSparks };
}
