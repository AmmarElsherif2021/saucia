import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Discrete (one-segment-at-a-time) wheel / key / touch scroll.
 *
 * Listeners are registered once: the scrolling flag and the active index are
 * mirrored into refs so wheel events during a transition are not dropped.
 */
export function useDiscreteScroll(
  sectionsCount: number,
  scrollToIndex: (index: number) => void,
) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeIndexRef = useRef(0);
  const isScrollingRef = useRef(false);
  const touchStartRef = useRef(0);
  const scrollToIndexRef = useRef(scrollToIndex);
  const sectionsCountRef = useRef(sectionsCount);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  useEffect(() => {
    scrollToIndexRef.current = scrollToIndex;
  }, [scrollToIndex]);
  useEffect(() => {
    sectionsCountRef.current = sectionsCount;
  }, [sectionsCount]);

  const navigate = useCallback((delta: number) => {
    if (isScrollingRef.current) return;

    const next = activeIndexRef.current + delta;
    if (next < 0 || next >= sectionsCountRef.current) return;

    isScrollingRef.current = true;
    scrollToIndexRef.current(next);
    setActiveIndex(next);

    // Cooldown aligned with the CSS smooth scroll (~650 ms).
    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 650);
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 15) return; // ignore trackpad micro-nudges
      event.preventDefault();
      navigate(event.deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        navigate(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        navigate(-1);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) touchStartRef.current = touch.clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const delta = touchStartRef.current - touch.clientY;
      if (Math.abs(delta) < 20) return;
      event.preventDefault();
      navigate(delta > 0 ? 1 : -1);
      touchStartRef.current = touch.clientY;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [navigate]);

  return { activeIndex, setActiveIndex, isScrolling: isScrollingRef };
}
