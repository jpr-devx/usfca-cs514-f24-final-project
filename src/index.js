import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create themed favicon
const faviconData = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#000080"/>
  <polygon points="20,20 80,20 50,80" fill="#FFD700"/>
  <text x="50" y="55" font-family="monospace" font-size="20" fill="white" text-anchor="middle">GOV</text>
</svg>
`;

// Set favicon and title
const setFaviconAndTitle = () => {
  // Set page title
  document.title = "FED-AI-SYS [RESTRICTED]";

  // Create favicon link element
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = 'data:image/svg+xml;base64,' + btoa(faviconData);

  // Remove existing favicons
  const existingFavicons = document.querySelectorAll('link[rel="icon"]');
  existingFavicons.forEach(favicon => favicon.remove());

  // Add new favicon
  document.head.appendChild(favicon);
};

// Apply favicon and title when the app loads
setFaviconAndTitle();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: Update favicon/title if needed when route changes
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', setFaviconAndTitle);
}

reportWebVitals();