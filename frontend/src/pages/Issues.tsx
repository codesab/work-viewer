
import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert, Table, Select, Space, Input } from 'antd';
import type { TableProps } from 'antd';

const { Title } = Typography;
const { Search } = Input;

interface JiraIssue {
  key: string;
  title: string;
  assignee: string | null;
  reporter: string;
  issue_type: string;
  status: string;
  start_date: string | null;
  due_date: string | null;
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
  const [searchText, setSearchText] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const projectKey = "PHNX";

  const fetchStatuses = async () => {
    try {
      const response = await fetch(
        `https://${window.location.hostname}/api/statuses/${projectKey}`
      );
      const data = await response.json();
      if (response.ok) {
        setAvailableStatuses(data.statuses);
      }
    } catch (err) {
      console.error("Failed to fetch statuses:", err);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

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

  const filteredIssues = issues?.items.filter(issue => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      issue.key.toLowerCase().includes(searchLower) ||
      issue.title.toLowerCase().includes(searchLower);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(issue.status);
    return matchesSearch && matchesStatus;
  });

  const columns: TableProps<JiraIssue>['columns'] = [
    {
      title: 'Key',
      dataIndex: 'key',
      sorter: (a, b) => a.key.localeCompare(b.key),
    },
    {
      title: 'Summary',
      dataIndex: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      render: (date: string | null) => date || 'Not set',
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      render: (date: string | null) => date || 'Not set',
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
        <Title level={2}>Product and Engineering Backlog 🚀</Title>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Search
            placeholder="Search by key or summary"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Space>
            <span>Issue Type:</span>
            <Space>
              <Select
                value={issueType}
                onChange={setIssueType}
                style={{ width: 120 }}
                options={[
                  { value: 'Story', label: 'Story' },
                  { value: 'Task', label: 'Task' },
                ]}
              />
              <Select
                mode="multiple"
                placeholder="Filter by status"
                value={selectedStatuses}
                onChange={setSelectedStatuses}
                style={{ width: 200 }}
                options={availableStatuses.map(status => ({ value: status, label: status }))}
                allowClear
              />
            </Space>
          </Space>
        </div>

        {error && <Alert type="error" message={error} />}
        
        <Table
          columns={columns}
          dataSource={filteredIssues}
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
