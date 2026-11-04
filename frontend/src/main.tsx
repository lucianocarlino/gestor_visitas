import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerReferenceDataRefresh } from './services/offline/referenceDataSync';
import { isNativeApp } from './platform/nativePlatform';

// Capturador visual de errores para tablets/móviles sin depuración USB
function renderFatalError(title: string, error: unknown) {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ''}` : String(error);
  const container = document.getElementById('root') || document.body;
  container.innerHTML = `
    <div style="padding: 24px; font-family: monospace; background: #fee2e2; color: #991b1b; min-height: 100vh; box-sizing: border-box;">
      <h2 style="margin-top: 0; font-size: 18px; font-weight: bold;">⚠️ Error al iniciar la aplicación</h2>
      <p style="font-weight: bold; margin-bottom: 8px;">${title}</p>
      <pre style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #f87171; overflow-x: auto; font-size: 12px; white-space: pre-wrap;">${message}</pre>
    </div>
  `;
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Window error:', event.error || event.message);
    renderFatalError('Error de script no controlado', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    renderFatalError('Promesa rechazada no controlada', event.reason);
  });
}

try {
  registerReferenceDataRefresh();
} catch (err) {
  console.warn('Fallo no fatal al registrar refresh de datos de referencia:', err);
}

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("No se encontró el elemento con id 'root' en el DOM.");
  }
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (err) {
  renderFatalError('Error durante el montaje de React', err);
}

// Service workers solo en web
if (import.meta.env.PROD && !isNativeApp() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
      console.error('No se pudo registrar el service worker:', error);
    });
  });
}
