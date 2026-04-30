import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// BrowserRouter gives us clean URLs for SEO. GitHub Pages serves a static site,
// so deep links (e.g. /product/sigma-60-600 entered directly) hit a 404 first
// and are redirected back here via public/404.html and the restore script in
// index.html. The basename matches Vite's `base` so links resolve correctly.
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename || undefined}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
