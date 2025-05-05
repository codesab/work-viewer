
// import React from 'react';
// import { Layout } from 'antd';
// import Issues from './pages/Issues';

// const { Header, Content } = Layout;

// const App: React.FC = () => {
//   return (
//     <Layout>
//       <Header style={{ color: 'white' }}>
        
//       </Header>
//       <Content>
//         <Issues />
//       </Content>
//     </Layout>
//   );
// };

// export default App;
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