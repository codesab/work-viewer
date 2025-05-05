import React from "react";
import ReactDOM from "react-dom/client";
import { createMemoryHistory, createBrowserHistory, History } from "history";
import App from "./App";

let rootComponent: React.ReactElement | null = null;
let root: ReactDOM.Root | null = null;

type MountOptions = {
  basePath?: string;
  onNavigate?: (location: { pathname: string }) => void;
  defaultHistory?: History;
  initialPath?: string;
};

const mount = (el: Element, { basePath, onNavigate, defaultHistory, initialPath }: MountOptions) => {
  const history = defaultHistory || createMemoryHistory({ initialEntries: [initialPath || "/"] });

  if (onNavigate) {
    history.listen(onNavigate);
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

const unmount = () => {
  if (root && rootComponent) {
    root.unmount();
    rootComponent = null;
  }
};

if (import.meta.env.MODE === "development") {
  const devRoot = document.querySelector("#work-viewer-root");
  if (devRoot) {
    mount(devRoot, {
      defaultHistory: createBrowserHistory(),
      basePath: "/app/releases",
    });
  }
}

export { mount, unmount };
