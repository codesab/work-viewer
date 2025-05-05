import('./bootstrap').then(({ mount }) => {
  const rootElement = document.getElementById('root');

  if (rootElement) {
    mount(rootElement, {
      onNavigate: (location: { pathname: string }) => {
        console.log('Workviewer MFE navigated', location);
      },
      defaultHistory: window.__POWERED_BY_QIANKUN__ ? undefined : createBrowserHistory(),
      initialPath: window.location.pathname,
    });
  }
});

import('./bootstrap').then(({ unmount }) => {
  window.workviewermfe_unmount = unmount;
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserHistory } from 'history';
import App from './App';

if (import.meta.env.NODE_ENV === 'development' && !window.__POWERED_BY_QIANKUN__) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    const history = createBrowserHistory();
    root.render(<App args={{ history, basePath: '' }} />);
  }
}
