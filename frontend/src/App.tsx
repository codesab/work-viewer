import React from "react";
import Issues from "./pages/Issues";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import './App.css';

interface AppProps {
  args: {
    basePath: string;
    history: any; // Ideally use History type from 'history' package
  };
}

const App: React.FC<AppProps> = ({ args }) => {
  return  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/app/release/list" replace />} />
      <Route path="/app/releases/:view?/:month?" element={<Issues basePath={args.basePath} history={null} />} />
    </Routes>
  </BrowserRouter>
  //<Issues basePath={args.basePath} history={args.history} />;
};

export default App;
