import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Typography, Space, Input, DatePicker } from "antd";
import dayjs from "dayjs";
import { JiraIssue, PaginatedResponse } from "../types";
import IssueListView from "../components/IssueListView";
import IssueCalendarView from "../components/IssueCalendarView";
import IssuesHeader from "../components/IssuesHeader";

const { Search } = Input;
const { MonthPicker } = DatePicker;

interface IssuesProps {
  basePath: string;
  history: any;
}

const Issues: React.FC<IssuesProps> = ({ basePath, history }) => {
  const [issues, setIssues] = useState<PaginatedResponse | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<JiraIssue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [issueType, setIssueType] = useState<string>("Story");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const { view } = useParams();
  const selectedView = view === "calendar" ? "calendar" : "list";
  const [viewMode, setViewMode] = useState<"list" | "calendar">(selectedView);
  const [total, setTotal] = useState<number>(0);

  const [currentMonth, setCurrentMonth] = useState<string>(
    dayjs().format("YYYY-MM")
  );
  const projectKey = "PHNX";

  const fetchIssues = async (month?: string) => {
    setLoading(true);
    let apiUrl = `${process.env.REACT_APP_JIRA_SERVICE_URL}/api/issues/${projectKey}?issue_type=${issueType}&page=${page}&size=${pageSize}`;
    if (month) {
      apiUrl += `&month=${month}`;
    }
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (response.ok) {
        setTotal(data.total);
        setIssues((prev: PaginatedResponse | null) =>
          page === 1
            ? data
            : {
                ...data,
                items: [...(prev?.items || []), ...data.items],
              }
        );

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
    fetchIssues(currentMonth);
  }, [issueType, page, currentMonth]);

  const onPanelChange = (value: dayjs.Dayjs) => {
    setCurrentMonth(value.format("YYYY-MM"));
    setPage(1);
  };

  const cellRender = (value: dayjs.Dayjs) => {
    const dateString = value.format("YYYY-MM-DD");
    const events = issues?.items?.filter(
      (item) =>
        dayjs(item.due_date || item.start_date).format("YYYY-MM-DD") ===
        dateString
    );
    const MAX_BADGES = 1;
    if (!events || events.length === 0) return null;

    const visible = events.slice(0, MAX_BADGES);
    const remaining = events.length - MAX_BADGES;

    return (
      <div>
        {visible.map((event) => (
          <div
            key={event.key}
            onClick={() => setSelectedIssue(event)}
            style={{ cursor: "pointer" }}
          >
            <Typography.Text>{event.title}</Typography.Text>
          </div>
        ))}
        {remaining > 0 && (
          <Typography.Text type="secondary" style={{ fontSize: "0.8em" }}>
            +{remaining} more
          </Typography.Text>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <IssuesHeader selectedView={selectedView} onViewChange={setViewMode} />

      {/* <Space
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <Search
          placeholder="Search by key or summary"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />

        <MonthPicker
          value={dayjs(currentMonth)}
          onChange={(value) => {
            if (value) setCurrentMonth(value.format("YYYY-MM"));
          }}
          placeholder="Select month"
        />
      </Space> */}

      {error && (
        <Alert type="error" message={error} style={{ marginTop: 16 }} />
      )}

      {selectedView === "list" ? (
        <IssueListView
          issues={issues?.items || []}
          selectedIssue={selectedIssue}
          onSelectIssue={setSelectedIssue}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          page={page}
          setPage={setPage}
          loading={loading}
          total={total}
          pageSize={pageSize}
          onClose={() => setSelectedIssue(null)}
        />
      ) : (
        <IssueCalendarView
          issues={issues?.items || []}
          onDateSelect={(issue) => setSelectedIssue(issue)}
          onMonthChange={(month) => setCurrentMonth(month)}
        />
      )}
    </div>
  );
};

export default Issues;
