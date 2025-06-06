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
import { motion, AnimatePresence } from "framer-motion";
import { JiraIssue } from "../types";
import IssueListItem from "./IssueListItem";

interface Props {
  issues: JiraIssue[];
  currentMonth: string;
  setCurrentMonth: (val: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  total: number;
  pageSize: number;
  fetchIssueDetails: any;
  onMonthChange: (month: string) => void; // new prop
}

const IssueListView: React.FC<Props> = ({
  issues,
  currentMonth,
  setCurrentMonth,
  page,
  setPage,
  loading,
  total,
  pageSize,
  fetchIssueDetails,
  onMonthChange
}) => {
  const allLoaded = issues.length >= total;
  const generateMonthRange = (current: string) => {
    const currentMonth = dayjs(current);
    return Array.from({ length: 7 }, (_, i) =>
      currentMonth.add(i - 3, "month").format("YYYY-MM")
    );
  };

  const filteredIssues = issues.filter((issue) => {
    const month = dayjs(issue.due_date || issue.start_date).format("YYYY-MM");
    return month === currentMonth;
  });

  // const groupedByMonth = filteredIssues.reduce((acc, issue) => {
  //   const monthKey = dayjs(issue.due_date || issue.start_date).format(
  //     "YYYY-MM"
  //   );
  //   acc[monthKey] = acc[monthKey] || [];
  //   acc[monthKey].push(issue);
  //   return acc;
  // }, {} as Record<string, JiraIssue[]>);

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
        <MonthScroller
          currentMonth={currentMonth}
          onChange={(month) => {
    onMonthChange(month); // delegate
  }}
        />
      </Col>
      <Col
        span={20}
        onScroll={handleScroll}
        style={{ height: "80vh", overflow: "auto" }}
      >
        {loading && page === 1 ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : issues.length === 0 ? (
          <Empty description="No issues found" style={{ marginTop: 48 }} />
        ) : (
          <AnimatePresence>
            <motion.div
              key={currentMonth} // re-triggers animation on month or page change
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {filteredIssues.length > 0 && (
                <div>
                  <div
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#fff",
                      padding: "8px 12px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {dayjs(currentMonth).format("MMMM YYYY")}
                    </Typography.Title>
                  </div>

                  <List
                    itemLayout="horizontal"
                    dataSource={filteredIssues}
                    renderItem={(issue) => (
                      <IssueListItem
                        key={issue.key}
                        issue={issue}
                        onClick={() => fetchIssueDetails(issue.key)}
                      />
                    )}
                  />
                </div>
              )}
              {loading && page > 1 ? (
                <div style={{ textAlign: "center", padding: 16 }}>
                  <Spin tip="Loading more issues..." />
                </div>
              ) : allLoaded ? (
                <div
                  style={{ textAlign: "center", padding: 16, color: "#888" }}
                >
                  <Typography.Text type="secondary">
                    🎉 That’s all for now! You’re all caught up.
                  </Typography.Text>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        )}
      </Col>
    </Row>
  );
};

export default IssueListView;
