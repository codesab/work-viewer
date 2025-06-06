export interface JiraIssue {
  key: string;
  title: string;
  summary?: string;
  assignee: string;
  reporter: string;
  issue_type: string;
  status: string;
  start_date: string | null;
  due_date: string | null;
  description: string | null;
  backers?: string[];
}

export interface PaginatedResponse {
  items: JiraIssue[];
  total: number;
  page: number;
  size: number;
}

export interface JiraSubtask {
  key: string;
  summary: string;
  status: string;
  assignee: string | null;
  created: string;
  updated: string;
  resolution_date: string | null;
}
