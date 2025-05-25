export interface JiraIssue {
  key: string;
  title: string;
  assignee: string;
  reporter: string;
  issue_type: string;
  status: string;
  start_date: string | null;
  due_date: string | null;
  description: string | null;
}

export interface PaginatedResponse {
  items: JiraIssue[];
  total: number;
  page: number;
  size: number;
}