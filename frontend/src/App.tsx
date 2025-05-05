
import React from 'react';
import Issues from './pages/Issues'; // Adjust path if needed

const App = ({ args }) => {
  return (
    <div>
      <Issues basePath={args.basePath} history={args.history} />
    </div>
  );
};

export default App;