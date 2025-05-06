import React, { useEffect, useState } from "react";
import {
  Calendar,
  Badge,
  Modal,
  Typography,
  Space,
  Select,
  Input,
  Alert,
  Descriptions,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { JiraIssue, PaginatedResponse } from "../types";

const { Title } = Typography;
const { Search } = Input;

interface IssuesProps {
  basePath: string;
  history: any; // Ideally use 'History' from the 'history' package
}

const Issues: React.FC<IssuesProps> = ({ basePath, history }) => {
  const [issues, setIssues] = useState<PaginatedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [issueType, setIssueType] = useState<string>("Story");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<JiraIssue[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>(
    dayjs().format("YYYY-MM")
  ); // State for current month
  const projectKey = "PHNX";
  const [selectedIssue, setSelectedIssue] = useState<JiraIssue | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAllIssuesModalVisible, setIsAllIssuesModalVisible] = useState(false);
  const [allIssuesForDate, setAllIssuesForDate] = useState<JiraIssue[]>([]);
  const [selectedDateForIssues, setSelectedDateForIssues] =
    useState<dayjs.Dayjs | null>(null);

  const fetchStatuses = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_JIRA_SERVICE_URL}/api/statuses/${projectKey}`
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

  const fetchIssues = async (month?: string) => {
    setLoading(true);
    let apiUrl = `${
      process.env.REACT_APP_JIRA_SERVICE_URL
    }/api/issues/${projectKey}?issue_type=${issueType}&page=${page}&size=${pageSize}`;
    if (month) {
      apiUrl += `&month=${month}`; // Add the month as a query parameter
    }
    try {
      const response = await fetch(apiUrl);
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
    fetchIssues(currentMonth); // Fetch issues for the current month on initial load
  }, [issueType, page, pageSize, currentMonth]); // Re-fetch if these dependencies change

  useEffect(() => {
    if (issues?.items) {
      const events = issues.items.reduce((acc, issue) => {
        const eventDate = issue.due_date || issue.start_date;
        if (eventDate && dayjs(eventDate).format("YYYY-MM") === currentMonth) {
          // Only include events for the current month
          acc.push({
            ...issue,
          });
        }
        return acc;
      }, [] as JiraIssue[]);
      setCalendarEvents(events);
    }
  }, [issues, currentMonth]);

  const getListData = (value: dayjs.Dayjs): JiraIssue[] => {
    const dateString = value.format("YYYY-MM-DD");
    return calendarEvents.filter((item) => item.due_date === dateString);
  };

  const MAX_BADGES_TO_SHOW = 1;

  const cellRender = (value: dayjs.Dayjs) => {
    const listData = getListData(value);
    const visibleBadges = listData.slice(0, MAX_BADGES_TO_SHOW);
    const remainingCount = listData.length - MAX_BADGES_TO_SHOW;
    const allIssuesOnDate =
      issues?.items?.filter(
        (issue) => issue.due_date === value.format("YYYY-MM-DD")
      ) || [];

    return (
      <div>
        {visibleBadges.map((item) => (
          <div
            key={item.title}
            style={{ marginBottom: 2 }}
            onClick={() => {
              if (item) {
                setSelectedIssue(item);
                setIsModalVisible(true);
              }
            }}
          >
            <Badge text={item.title} />
          </div>
        ))}
        {remainingCount > 0 && (
          <Typography.Text
            type="secondary"
            style={{ fontSize: "0.8em" }}
            onClick={() => {
              setSelectedDateForIssues(value);
              setAllIssuesForDate(allIssuesOnDate);
              setIsAllIssuesModalVisible(true);
            }}
          >
            +{remainingCount} more
          </Typography.Text>
        )}
      </div>
    );
  };

  const onPanelChange = (value: dayjs.Dayjs) => {
    setCurrentMonth(value.format("YYYY-MM"));
    setPage(1); // Reset page on month change
  };

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Title level={2}>Product and Engineering Releases 🗓️</Title>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Search
            placeholder="Search by key or summary"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />

          <Space>
            {/* <span>Issue Type:</span> */}
            <Space>
              {/* <Select
                value={issueType}
                onChange={setIssueType}
                style={{ width: 120 }}
                options={[
                  { value: "Story", label: "Story" },
                  { value: "Task", label: "Task" },
                ]}
              /> */}
              {/* <Select
                mode="multiple"
                placeholder="Filter by status"
                value={selectedStatuses}
                onChange={setSelectedStatuses}
                style={{ width: 200 }}
                options={availableStatuses.map((status) => ({
                  value: status,
                  label: status,
                }))}
                allowClear
              /> */}
            </Space>
          </Space>
        </div>

        {error && <Alert type="error" message={error} />}

        <Calendar cellRender={cellRender} onPanelChange={onPanelChange} />
      </Space>
      <Modal
        title={
          selectedIssue
            ? `Issue Details: ${selectedIssue.key}`
            : "Issue Details"
        }
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        {selectedIssue && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Key">
              {selectedIssue.key}
            </Descriptions.Item>
            <Descriptions.Item label="Summary">
              {selectedIssue.title}
            </Descriptions.Item>
            <Descriptions.Item label="Assignee">
              {selectedIssue.assignee || "Unassigned"}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {`${selectedIssue.description?.substring(
                0,
                250
              )} .. (Truncated for brevity)` || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">
              {selectedIssue.due_date || "--"}
              {selectedIssue.due_date &&
              dayjs().isAfter(dayjs(selectedIssue.due_date), "day") ? (
                <Badge
                  status="error"
                  text={`${selectedIssue.status} (Delayed)`}
                />
              ) : (
                <></>
              )}
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
        )}
      </Modal>
      <Modal
        title={
          selectedDateForIssues
            ? `Issues on ${selectedDateForIssues.format("YYYY-MM-DD")}`
            : "Issues"
        }
        open={isAllIssuesModalVisible}
        onOk={() => setIsAllIssuesModalVisible(false)}
        onCancel={() => setIsAllIssuesModalVisible(false)}
      >
        {allIssuesForDate.length > 0 ? (
          <Space direction="vertical">
            {allIssuesForDate.map((issue) => (
              <div key={issue.key}>
                <Typography.Text strong>{issue.key}:</Typography.Text>{" "}
                {issue.title}
              </div>
            ))}
          </Space>
        ) : (
          <Typography.Text>No issues on this date.</Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default Issues;
