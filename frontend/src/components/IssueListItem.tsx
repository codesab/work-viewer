import React from "react";
import { Avatar, List, Tag, Typography, Space, Tooltip, Badge } from "antd";
import { JiraIssue } from "../types";
import {
  BugOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface Props {
  issue: JiraIssue;
  onClick: () => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "done":
      return "green";
    case "in progress":
      return "blue";
    case "to do":
      return "gray";
    default:
      return "default";
  }
};

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "bug":
      return <BugOutlined style={{ color: "red" }} />;
    case "story":
      return <FileTextOutlined style={{ color: "blue" }} />;
    case "epic":
      return <ThunderboltOutlined style={{ color: "purple" }} />;
    case "sub-task":
      return <CheckCircleOutlined style={{ color: "green" }} />;
    default:
      return <FileTextOutlined />;
  }
};

const IssueListItem: React.FC<Props> = ({ issue, onClick }) => {
  const isDelayed = issue.due_date
    ? dayjs().isAfter(dayjs(issue.due_date), "day")
    : false;

  return (
    <List.Item
      style={{ cursor: "pointer" }}
      onClick={onClick}
      actions={[
        <Tag color={getStatusColor(issue.status)}>{issue.status}</Tag>,
        isDelayed && (
          <Tooltip title="Delayed">
            <Badge status="error" text="Overdue" />
          </Tooltip>
        ),
      ].filter(Boolean)}
    >
      <List.Item.Meta
        avatar={<Avatar>{issue.assignee?.charAt(0)}</Avatar>}
        title={
          <Space>
            {getIcon(issue.issue_type)}
            <Typography.Text strong>{issue.key}</Typography.Text>
            <Typography.Text>{issue.title}</Typography.Text>
          </Space>
        }
        description={`Due: ${issue.due_date || "--"}`}
      />
    </List.Item>
  );
};

export default IssueListItem;
