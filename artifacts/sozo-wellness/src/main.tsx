import { createRoot, hydrateRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

const root = document.getElementById('root')!;
const options: Parameters<typeof createRoot>[1] = {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
};
const app = (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
if (root.hasChildNodes()) {
  hydrateRoot(root, app, options);
} else {
  createRoot(root, options).render(app);
}
