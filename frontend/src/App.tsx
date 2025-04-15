
import React from 'react';
import { Layout } from 'antd';
import Issues from './pages/Issues';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout>
      <Header style={{ color: 'white' }}>
        JIRA Dashboard
      </Header>
      <Content>
        <Issues />
      </Content>
    </Layout>
  );
};

export default App;
