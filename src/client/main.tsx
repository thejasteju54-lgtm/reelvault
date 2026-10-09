import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { ToastProvider } from './components/ui/Toast.js';
import './styles/main.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in document.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
