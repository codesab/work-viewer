import React from "react";
import {
  Card,
  Typography,
  Space,
  Avatar,
  Tag,
  Button,
  Progress,
  List,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { JiraIssue, JiraSubtask } from "../types";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { getIcon, getInitials, getStatusColor, getTagColor } from "../utils";
import EmptyStateSprite from "./EmptyStateSprite";

const { Text, Title } = Typography;

interface Props {
  issueDetails: {
    issue: JiraIssue;
    subtasks: JiraSubtask[];
    progress: {
      total_subtasks: number;
      completed: number;
      in_progress: number;
      todo: number;
      completed_percentage: number;
      in_progress_percentage: number;
      todo_percentage: number;
    };
  } | null;
  loading: boolean;
  onClose: () => void;
}

const IssuePreviewer: React.FC<Props> = (props: Props) => {
  const { issueDetails, loading, onClose } = props;

  if (loading) {
    return (
      <Card style={{ height: "100%" }}>
        <Space
          direction="vertical"
          style={{ width: "100%", marginTop: 64 }}
          align="center"
        >
          <Space direction={"vertical"}>
            <EmptyStateSprite message="Loading details..." />
          </Space>
        </Space>
      </Card>
    );
  }

  if (!issueDetails) {
    return (
      <Card
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EmptyStateSprite />
      </Card>
    );
  }
  const { issue, subtasks, progress } = issueDetails;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{
        height: "90vh", // full viewport height
        overflow: "hidden", // prevent outer scroll
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card
        title={
          <Space>
            {getIcon(issue.issue_type)}
            <Title level={5} style={{ margin: 0 }}>
              {issue.key}
            </Title>
          </Space>
        }
        extra={
          <Button
            type={"default"}
            icon={<CloseOutlined />}
            onClick={() => onClose()}
          />
        }
        bordered
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        bodyStyle={{ flex: 1, overflowY: "auto", paddingRight: 16 }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space direction={"vertical"}>
            <Text type="secondary">
              <InfoCircleOutlined /> Summary
            </Text>
            <div>{issue.summary || "--"}</div>
          </Space>

          <Space direction={"vertical"}>
            <Text type="secondary">
              <UserOutlined /> Assignee
            </Text>
            <Space>
              <Avatar style={{ backgroundColor: "#7265e6" }}>
                {getInitials(issue.assignee)}
              </Avatar>
              <Text>{issue.assignee}</Text>
            </Space>
          </Space>

          <Space direction={"vertical"}>
            <Text type="secondary">
              <CalendarOutlined /> Due Date
            </Text>
            <div>
              {issue.due_date
                ? `Due ${
                    dayjs(issue.due_date).isBefore(dayjs(), "day")
                      ? `overdue by ${dayjs().diff(
                          issue.due_date,
                          "day"
                        )} day(s)`
                      : dayjs(issue.due_date).isSame(dayjs(), "day")
                      ? "today"
                      : `in ${dayjs(issue.due_date).diff(
                          dayjs(),
                          "day"
                        )} day(s)`
                  }`
                : "No due date"}
            </div>
          </Space>

          <div>
            <Text type="secondary">
              <Tag color={getStatusColor(issue.status)}>{issue.status}</Tag>
            </Text>
          </div>

          <Progress percent={progress.completed_percentage} status="active" />

          <List
            header={<Text strong>Subtasks</Text>}
            dataSource={subtasks}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Tag color={getStatusColor(item.status)}>{item.status}</Tag>,
                ]}
              >
                <Typography.Text>{item.summary}</Typography.Text>
              </List.Item>
            )}
          />
        </Space>
      </Card>
    </motion.div>
  );
};

export default IssuePreviewer;
