import React from "react";
import Issues from "./pages/Issues";

interface AppProps {
  args: {
    basePath: string;
    history: any; // Ideally use History type from 'history' package
  };
}

const App: React.FC<AppProps> = ({ args }) => {
  return <Issues basePath={args.basePath} history={args.history} />;
};

export default App;
