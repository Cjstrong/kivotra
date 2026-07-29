/**
 * The single shared film-progress store. One ScrollTrigger writes it; the
 * canvas and the text layer read it — no React re-renders on scroll.
 */

type Listener = (p: number) => void;

let value = 0;
const listeners = new Set<Listener>();

export const filmProgress = {
  get: () => value,
  set: (v: number) => {
    value = v;
    listeners.forEach((l) => l(v));
  },
  subscribe: (l: Listener) => {
    listeners.add(l);
    l(value);
    return () => {
      listeners.delete(l);
    };
  },
};
