import React from "react";
import { Calendar, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { JiraIssue } from "../types";

interface Props {
  issues: JiraIssue[];
  onDateSelect: (issue: JiraIssue) => void;
  onMonthChange: (month: string) => void;
}

const IssueCalendarView: React.FC<Props> = ({
  issues,
  onDateSelect,
  onMonthChange,
}) => {
  const cellRender = (value: Dayjs) => {
    const dateString = value.format("YYYY-MM-DD");
    const dayIssues = issues.filter(
      (item) =>
        dayjs(item.due_date || item.start_date).format("YYYY-MM-DD") ===
        dateString
    );

    const MAX_BADGES = 1;
    if (dayIssues.length === 0) return null;

    const visible = dayIssues.slice(0, MAX_BADGES);
    const remaining = dayIssues.length - MAX_BADGES;

    return (
      <div>
        {visible.map((event) => (
          <div
            key={event.key}
            onClick={() => onDateSelect(event)}
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
    <Calendar
      cellRender={cellRender}
      onPanelChange={(value) => onMonthChange(value.format("YYYY-MM"))}
    />
  );
};

export default IssueCalendarView;
