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
import { CalendarOutlined, CheckCircleOutlined, WarningFilled } from "@ant-design/icons";

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
            {issue.due_date ? (
              issue.status.toLowerCase() === "done" ? (
                dayjs(issue.due_date).isBefore(dayjs(), "day") ? (
                  <Typography.Text type="secondary">
                    <WarningFilled color="warning"/> Shipped {dayjs().diff(issue.due_date, "day")} day(s) late
                  </Typography.Text>
                ) : (
                  <Typography.Text type="secondary">
                    <CheckCircleOutlined color="success" /> Completed on time
                  </Typography.Text>
                )
              ) : dayjs(issue.due_date).isBefore(dayjs(), "day") ? (
                <Typography.Text type="danger">
                  <WarningFilled color="danger"/> Overdue by {dayjs().diff(issue.due_date, "day")} day(s)
                </Typography.Text>
              ) : dayjs(issue.due_date).isSame(dayjs(), "day") ? (
                <Typography.Text><CalendarOutlined color="blue" /> Due today</Typography.Text>
              ) : (
                <Typography.Text type="secondary">
                  <CalendarOutlined />  Due in {dayjs(issue.due_date).diff(dayjs(), "day")} day(s)
                </Typography.Text>
              )
            ) : (
              <Typography.Text type="secondary">No due date</Typography.Text>
            )}
          </Space>
        }
      />
    </List.Item>
  );
};

export default IssueListItem;
