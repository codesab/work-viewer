import React from "react";
import ReactDOM from "react-dom/client";
import {
  createMemoryHistory,
  createBrowserHistory,
  MemoryHistory,
  BrowserHistory,
} from "history";
import type { Location, Update } from 'history';
import App from "./App";

let rootComponent: React.ReactElement | null = null;
let root: ReactDOM.Root | null = null;

type HistoryType = MemoryHistory | BrowserHistory;

type MountOptions = {
  basePath: string;
  onNavigate?: (location: { pathname: string }) => void;
  defaultHistory?: HistoryType;
  initialPath?: string;
};

// Mount function to start up the app
const mount = (
  el: Element,
  { basePath, onNavigate, defaultHistory, initialPath }: MountOptions
) => {
  const history: HistoryType =
    defaultHistory ||
    createMemoryHistory({
      initialEntries: [initialPath || "/"],
    });

  if (onNavigate) {
    history.listen(({ location }: { location: Location }) => {
      onNavigate({ pathname: location.pathname });
    });
  }

  if (el) {
    root = ReactDOM.createRoot(el);
    const args = {
      history,
      basePath: basePath || "",
    };
    rootComponent = <App args={args} />;
    root.render(rootComponent);
  }

  return {
    onParentNavigate({ pathname: nextPathname }: { pathname: string }) {
      const { pathname } = history.location;

      if (pathname !== nextPathname) {
        history.push(nextPathname);
      }
    },
  };
};

// Function to unmount the microfrontend
const unmount = (el: Element) => {
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
      basePath: "/app/releases",
      onNavigate: () => {}, // ← required to satisfy full typing
      initialPath: "/",
    };
    mount(devRoot, args);
  }
}
// Export both the mount and unmount functions
export { mount, unmount };
