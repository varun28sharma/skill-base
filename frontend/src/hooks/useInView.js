import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that monitors when an element is in view using IntersectionObserver.
 * Configured by default to trigger when at least 60% of the element is visible.
 */
export default function useInView(options = { threshold: 0.6 }) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    const target = ref.current;
    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [options.threshold]);

  return [ref, isInView];
}
