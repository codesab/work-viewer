
import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert, Table, Select, Space } from 'antd';
import type { TableProps } from 'antd';

const { Title } = Typography;

interface JiraIssue {
  key: string;
  title: string;
  assignee: string | null;
  reporter: string;
  issue_type: string;
}

interface PaginatedResponse {
  items: JiraIssue[];
  total: number;
  page: number;
  size: number;
}

const Issues: React.FC = () => {
  const [issues, setIssues] = useState<PaginatedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [issueType, setIssueType] = useState<string>('Story');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const projectKey = "PH";

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${window.location.hostname}/api/issues/${projectKey}?issue_type=${issueType}&page=${page}&size=${pageSize}`
      );
      const data = await response.json();
      if (response.ok) {
        setIssues(data);
        setError(null);
      } else {
        setError(data.detail);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [issueType, page, pageSize]);

  const columns: TableProps<JiraIssue>['columns'] = [
    {
      title: 'Key',
      dataIndex: 'key',
      sorter: true,
    },
    {
      title: 'Title',
      dataIndex: 'title',
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee',
      render: (assignee: string | null) => assignee || 'Unassigned',
    },
    {
      title: 'Reporter',
      dataIndex: 'reporter',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Title level={2}>Project Issues</Title>
        
        <Space>
          <span>Issue Type:</span>
          <Select
            value={issueType}
            onChange={setIssueType}
            style={{ width: 120 }}
            options={[
              { value: 'Story', label: 'Story' },
              { value: 'Task', label: 'Task' },
            ]}
          />
        </Space>

        {error && <Alert type="error" message={error} />}
        
        <Table
          columns={columns}
          dataSource={issues?.items}
          rowKey="key"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: issues?.total,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize || 10);
            },
          }}
        />
      </Space>
    </div>
  );
};

export default Issues;
