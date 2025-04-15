
import React from 'react';
import { Layout } from 'antd';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout>
      <Header style={{ color: 'white' }}>
        JIRA Dashboard
      </Header>
      <Content style={{ padding: '20px' }}>
        Dashboard Content
      </Content>
    </Layout>
  );
};

export default App;
