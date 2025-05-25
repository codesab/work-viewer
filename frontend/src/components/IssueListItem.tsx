import React from "react";
import { Avatar, List, Tag, Typography, Space, Tooltip, Badge } from "antd";
import { JiraIssue } from "../types";
import dayjs from "dayjs";
import {
  getAvatarColor,
  getIcon,
  getInitials,
  getStatusColor,
  getTagColor,
} from "../utils";

interface Props {
  issue: JiraIssue;
  onClick: () => void;
}

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
      ].filter(Boolean)}
    >
      <List.Item.Meta
        avatar={
          <Tooltip title={issue.assignee || "Unassigned"}>
            <Avatar
              style={{ backgroundColor: getAvatarColor(issue.assignee || "") }}
            >
              {getInitials(issue.assignee || "")}
            </Avatar>
          </Tooltip>
        }
        title={
          <Space>
            <Tag
              icon={getIcon(issue.issue_type)}
              color={getTagColor(issue.issue_type)}
            >
              {issue.key}
            </Tag>
            <Typography.Text>{issue.title}</Typography.Text>
          </Space>
        }
        description={
          <Space>
            {issue.due_date
              ? `Due ${
                  dayjs(issue.due_date).isBefore(dayjs(), "day")
                    ? `overdue by ${dayjs().diff(issue.due_date, "day")} day(s)`
                    : dayjs(issue.due_date).isSame(dayjs(), "day")
                    ? "today"
                    : `in ${dayjs(issue.due_date).diff(dayjs(), "day")} day(s)`
                }`
              : "No due date"}
            {isDelayed && (
              <Tooltip title="Delayed">
                <Badge status="error" text="Overdue" />
              </Tooltip>
            )}
          </Space>
        }
      />
    </List.Item>
  );
};

export default IssueListItem;
