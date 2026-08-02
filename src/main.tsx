// Patch window.fetch if defined as getter-only property in sandboxed iframe environment
if (typeof window !== 'undefined') {
  try {
    let currentFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get: () => currentFetch,
      set: (fn) => { currentFetch = fn; },
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // Ignore error if property is immutable
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
