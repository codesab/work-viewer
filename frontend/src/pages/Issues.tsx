import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Typography, Space, Input, DatePicker, Row, Col } from "antd";
import dayjs from "dayjs";
import { JiraIssue, JiraSubtask, PaginatedResponse } from "../types";
import IssueListView from "../components/IssueListView";
import IssueCalendarView from "../components/IssueCalendarView";
import IssuesHeader from "../components/IssuesHeader";
import IssuePreviewer from "../components/IssuePreviewer";

const { Search } = Input;
const { MonthPicker } = DatePicker;

interface IssuesProps {
  basePath: string;
  history: any;
}

const Issues: React.FC<IssuesProps> = ({ basePath, history }) => {
  const [issues, setIssues] = useState<PaginatedResponse | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<{
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
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [issueType, setIssueType] = useState<string>("Story");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const { view, month } = useParams();
  const selectedView = view === "calendar" || view === "list" ? view : "list";
  const [viewMode, setViewMode] = useState<"list" | "calendar">(selectedView);
  const [total, setTotal] = useState<number>(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState<string>(
    month || dayjs().format("YYYY-MM")
  );
  const projectKey = "PHNX";

  const fetchIssueDetails = async (issueKey: string) => {
    setPreviewLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_JIRA_SERVICE_URL}/api/issue/${issueKey}`
      );
      const data = await response.json();
      if (response.ok) {
        setSelectedIssue(data); // This will now be detailed
      } else {
        console.error("Failed to fetch issue details:", data.detail);
      }
    } catch (err) {
      console.error("Error fetching issue details:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

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

  const handleMonthChange = (month: string) => {
  setPage(1);
  setLoading(true);
  setIssues(null); // this works now because state is here
  setCurrentMonth(month);
  navigate(`/app/releases/${viewMode}/${month}`);
};


  return (
    <div style={{padding: 24}} className="app-releases">
      <IssuesHeader
        selectedView={selectedView}
        onViewChange={(val) => navigate(`/app/releases/${val}`)} 
        setSelectedIssue={(issueKey: string) => fetchIssueDetails(issueKey)}      
        />
      <Row gutter={24}>
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

        <Col span={18}>
          {error && (
            <Alert type="error" message={error} style={{ marginTop: 16 }} />
          )}

          {selectedView === "list" ? (
            <IssueListView
              issues={issues?.items || []}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              onMonthChange={handleMonthChange}
              page={page}
              setPage={setPage}
              loading={loading}
              total={total}
              pageSize={pageSize}
              fetchIssueDetails={fetchIssueDetails}
            />
          ) : (
            <IssueCalendarView
              issues={issues?.items || []}
              onDateSelect={(issue) => fetchIssueDetails(issue.key)}
              onMonthChange={(month) => setCurrentMonth(month)}
            />
          )}
        </Col>
        <Col span={6} style={{ position: "relative", minHeight: 300 }}>
          <IssuePreviewer
            issueDetails={selectedIssue}
            loading={previewLoading}
            onClose={() => setSelectedIssue(null)}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Issues;
