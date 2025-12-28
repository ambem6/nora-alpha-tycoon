import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GlobalStyles } from './styles/GlobalStyles';

// Initialize Telegram WebApp hooks
// @ts-ignore
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
  document.body.style.backgroundColor = tg.backgroundColor || '#000000';
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GlobalStyles />
    <App />
  </React.StrictMode>
);
