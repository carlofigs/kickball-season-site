import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import { ToastProvider } from './shared/toast/toast_provider';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-sans/800.css';
import './global.css';

const rootEl = document.getElementById('root');
if (rootEl == null) {
  throw new Error('Missing #root element');
}

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter basename={scheduleBasename()}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);

function scheduleBasename(): string | undefined {
  const base = import.meta.env.BASE_URL;
  if (base === '/') return undefined;
  return base.replace(/\/$/, '') || undefined;
}
