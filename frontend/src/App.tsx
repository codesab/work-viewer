import React from "react";
import Issues from "./pages/Issues";
import { BrowserRouter, Route, Routes } from "react-router-dom";

interface AppProps {
  args: {
    basePath: string;
    history: any; // Ideally use History type from 'history' package
  };
}

const App: React.FC<AppProps> = ({ args }) => {
  return  <BrowserRouter>
    <Routes>
      <Route path="/issues/:view?" element={<Issues basePath="/issues" history={null} />} />
    </Routes>
  </BrowserRouter>
  //<Issues basePath={args.basePath} history={args.history} />;
};

export default App;
