
// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App'
// import { ConfigProvider } from 'antd'

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <ConfigProvider>
//       <App />
//     </ConfigProvider>
//   </React.StrictMode>,
// )

import('./bootstrap')
  .then(({ mount }) => {
    const rootElement = document.getElementById('root'); // Or your main app container ID

    if (rootElement) {
      mount(rootElement, {
        onNavigate: (location) => {
          // Optional: Handle navigation events from the container
          console.log('Workviewer MFE navigated', location);
        },
        defaultHistory: window.__POWERED_BY_QIANKUN__ ? undefined : createBrowserHistory(),
        initialPath: window.location.pathname,
      });
    }
  });

import('./bootstrap')
  .then(({ unmount }) => {
    // Optional: You might need to expose the unmount function globally
    // or handle unmounting in a specific lifecycle within your container.
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
    const args = {
      history,
      basePath: '',
    };
    root.render(
        <App args={args} />
    );
  }
}