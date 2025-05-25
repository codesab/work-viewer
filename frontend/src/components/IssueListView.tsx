import {
  Col,
  Descriptions,
  Row,
  Typography,
  Tag,
  List,
  Menu,
  Skeleton,
  Spin,
  Empty,
} from "antd";
import React from "react";
import dayjs from "dayjs";
import { JiraIssue } from "../types";
import IssueListItem from "./IssueListItem";

interface Props {
  issues: JiraIssue[];
  selectedIssue: JiraIssue | null;
  onSelectIssue: (issue: JiraIssue) => void;
  currentMonth: string;
  setCurrentMonth: (val: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  total: number;
  pageSize: number;
}

const IssueListView: React.FC<Props> = ({
  issues,
  selectedIssue,
  onSelectIssue,
  currentMonth,
  setCurrentMonth,
  page,
  setPage,
  loading,
  total,
  pageSize
}) => {
  const allLoaded = issues.length >= total;
  const generateMonthRange = (current: string) => {
    const currentMonth = dayjs(current);
    return Array.from({ length: 7 }, (_, i) =>
      currentMonth.add(i - 3, "month").format("YYYY-MM")
    );
  };

  const MonthScroller = ({
    currentMonth,
    onChange,
  }: {
    currentMonth: string;
    onChange: (month: string) => void;
  }) => {
    const months = generateMonthRange(currentMonth);

    return (
      <Menu
        selectedKeys={[currentMonth]}
        mode="inline"
        style={{ width: 150, height: "100%", overflowY: "auto" }}
        onClick={({ key }) => onChange(key)}
      >
        {months.map((month) => (
          <Menu.Item key={month}>{dayjs(month).format("MMM YYYY")}</Menu.Item>
        ))}
      </Menu>
    );
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
  if (scrollTop + clientHeight >= scrollHeight - 50 && !allLoaded) {
    setPage((prev: number) => prev + 1);
  }
};

  return (
    <Row gutter={16}>
      <Col span={4}>
        <MonthScroller currentMonth={currentMonth} onChange={setCurrentMonth} />
      </Col>
      <Col
        span={14}
        onScroll={handleScroll}
        style={{ height: "80vh", overflow: "auto" }}
      >
        {loading && page === 1 ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : issues.length === 0 ? (
          <Empty description="No issues found" style={{ marginTop: 48 }} />
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={issues}
              renderItem={(issue) => (
                <IssueListItem
                  key={issue.key}
                  issue={issue}
                  onClick={() => onSelectIssue(issue)}
                />
              )}
            />
            {loading && page > 1 ? (
              <div style={{ textAlign: "center", padding: 16 }}>
                <Spin tip="Loading more issues..." />
              </div>
            ) : allLoaded ? (
              <div style={{ textAlign: "center", padding: 16, color: "#888" }}>
                <Typography.Text type="secondary">
                  🎉 That’s all for now! You’re all caught up.
                </Typography.Text>
              </div>
            ) : null}
          </>
        )}
      </Col>
      <Col span={6}>
        {selectedIssue ? (
          <Descriptions
            bordered
            column={1}
            size="small"
            title={`Issue Details: ${selectedIssue.key}`}
          >
            <Descriptions.Item label="Summary">
              {selectedIssue.title}
            </Descriptions.Item>
            <Descriptions.Item label="Assignee">
              {selectedIssue.assignee || "Unassigned"}
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">
              {selectedIssue.due_date || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  selectedIssue.status === "Done"
                    ? "green"
                    : selectedIssue.status === "In Progress"
                    ? "blue"
                    : "gray"
                }
              >
                {selectedIssue.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">Select an issue</Typography.Text>
        )}
      </Col>
    </Row>
  );
};

export default IssueListView;
