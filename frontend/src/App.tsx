
import React from 'react';
import { Layout } from 'antd';
import Issues from './pages/Issues';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white' }}>
        JIRA Dashboard
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 24 }}>
        <Issues />
      </Content>
    </Layout>
  );
};

export default App;
