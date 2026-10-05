import { useState, useEffect } from 'react';

/**
 * Shared Single-Source Scroll Store
 * Exposes: scrollY, smoothedScrollY, overallProgress, activeChapter, chapterProgress
 *
 * Prevents multiple concurrent window scroll event listeners.
 */

let state = {
  scrollY: 0,
  smoothedScrollY: 0,
  overallProgress: 0,
  activeChapter: '00',
  chapterProgress: 0,
};

const listeners = new Set();

export const scrollStore = {
  getState: () => state,
  updateState: (newState) => {
    state = { ...state, ...newState };
    listeners.forEach((cb) => cb(state));
  },
  subscribe: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
};

export default function useScrollStore() {
  const [currentStoreState, setCurrentStoreState] = useState(scrollStore.getState());

  useEffect(() => {
    const unsubscribe = scrollStore.subscribe((newState) => {
      setCurrentStoreState(newState);
    });
    return unsubscribe;
  }, []);

  return currentStoreState;
}
