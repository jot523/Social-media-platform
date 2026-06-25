/**
 * useInfiniteScroll Hook
 * Triggers a callback when the user scrolls near the bottom of the page
 */

import { useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (callback, { threshold = 200, enabled = true } = {}) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const handleScroll = useCallback(() => {
    if (!enabled) return;
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      callbackRef.current();
    }
  }, [enabled, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
};