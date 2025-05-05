import React from "react";
import ReactDOM from 'react-dom/client';
import { createMemoryHistory, createBrowserHistory } from "history";
import App from "./App"; // Adjust path if needed

// Declare a variable to hold the root React component
let rootComponent = null;

// Declare a variable to hold the root instance
let root = null;

// Mount function to start up the app
const mount = (el, { basePath, onNavigate, defaultHistory, initialPath }) => {
  const history =
    defaultHistory ||
    createMemoryHistory({
      initialEntries: [initialPath],
    });

  if (onNavigate) {
    history.listen(onNavigate);
  }

  if (el) {
    root = ReactDOM.createRoot(el);
    const args = {
      history,
      basePath: basePath || "",
    };
    rootComponent = (
        <App args={args} />
    );
    root.render(rootComponent);
  }

  return {
    onParentNavigate({ pathname: nextPathname }) {
      const { pathname } = history.location;

      if (pathname !== nextPathname) {
        history.push(nextPathname);
      }
    },
  };
};

// Function to unmount the microfrontend
const unmount = (el) => {
  if (root && rootComponent) {
    root.unmount(); // Use root.unmount() to unmount the root
    rootComponent = null;
  }
};

// If we are in development and in isolation,
// call mount immediately
if (process.env.NODE_ENV === "development") {
  const devRoot = document.querySelector("#work-viewer-root");

  if (devRoot) {
    const args = {
      defaultHistory: createBrowserHistory(),
      basePath:'/app/releases',
    };
    mount(devRoot, args);
  }
}
// Export both the mount and unmount functions
export { mount, unmount };