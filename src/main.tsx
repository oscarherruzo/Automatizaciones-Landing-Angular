/**
 * Punto de entrada de la aplicacion React.
 * Monta el arbol de componentes en el nodo #root del index.html.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { App } from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontro el elemento #root en el DOM.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
