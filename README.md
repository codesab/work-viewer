
# JIRA Dashboard API

A FastAPI-based backend service for managing JIRA issues with a comprehensive set of APIs for creating, retrieving, and managing tickets.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```
JIRA_SERVER=https://your-jira-instance.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
```

3. Run the application:
```bash
cd backend && uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

## API Documentation

### Authentication & Health Check

#### 1. Health Check
**GET** `/`

**Response:**
```json
{
  "status": "healthy",
  "message": "JIRA Dashboard API is running"
}
```

#### 2. Validate Authentication
**GET** `/api/validate-auth`

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "name": "John Doe",
    "email": "john.doe@company.com"
  }
}
```

### Project Management

#### 3. Validate Project
**GET** `/api/validate-project/{project_key}`

**Example:** `GET /api/validate-project/PROJ`

**Response:**
```json
{
  "exists": true,
  "id": "10001",
  "name": "My Project",
  "projectCategory": "Software Development"
}
```

#### 4. Get Project Statuses
**GET** `/api/statuses/{project_key}`

**Example:** `GET /api/statuses/PROJ`

**Response:**
```json
{
  "statuses": [
    "To Do",
    "In Progress",
    "In Review",
    "Done"
  ]
}
```

### Issue Management

#### 5. Get Issues (with Pagination and Filtering)
**GET** `/api/issues/{project_key}`

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `size` (int, default: 10) - Items per page
- `sort_by` (str, default: "key") - Sort field
- `sort_order` (str, default: "asc") - Sort order (asc/desc)
- `month` (str, optional) - Filter by month (YYYY-MM format)

**Example:** `GET /api/issues/PROJ?page=1&size=5&month=2024-01`

**Response:**
```json
{
  "items": [
    {
      "key": "PROJ-123",
      "title": "Implement user authentication",
      "description": "Add OAuth2 authentication to the application",
      "assignee": "John Doe",
      "reporter": "Jane Smith",
      "issue_type": "Story",
      "status": "In Progress",
      "start_date": "2024-01-15",
      "due_date": "2024-01-30"
    }
  ],
  "total": 45,
  "page": 1,
  "size": 5
}
```

#### 6. Get Issue Details with Subtasks and Progress
**GET** `/api/issue/{issue_key}`

**Example:** `GET /api/issue/PROJ-123`

**Response:**
```json
{
  "issue": {
    "key": "PROJ-123",
    "summary": "Implement user authentication",
    "description": "Add OAuth2 authentication to the application",
    "status": "In Progress",
    "issue_type": "Story",
    "priority": "High",
    "assignee": "John Doe",
    "reporter": "Jane Smith",
    "created": "2024-01-10T10:00:00.000Z",
    "updated": "2024-01-20T15:30:00.000Z",
    "due_date": "2024-01-30",
    "resolution_date": null,
    "start_date": "2024-01-15",
    "backers": ["john.doe@company.com", "jane.smith@company.com", "alice.johnson@company.com"]
  },
  "subtasks": [
    {
      "key": "PROJ-124",
      "summary": "Setup OAuth2 provider",
      "status": "Done",
      "assignee": "John Doe",
      "created": "2024-01-10T10:00:00.000Z",
      "updated": "2024-01-18T14:00:00.000Z",
      "resolution_date": "2024-01-18T14:00:00.000Z"
    },
    {
      "key": "PROJ-125",
      "summary": "Implement login UI",
      "status": "In Progress",
      "assignee": "Alice Johnson",
      "created": "2024-01-12T09:00:00.000Z",
      "updated": "2024-01-20T11:00:00.000Z",
      "resolution_date": null
    }
  ],
  "assignees": ["John Doe", "Alice Johnson"],
  "progress": {
    "total_subtasks": 3,
    "completed": 1,
    "in_progress": 1,
    "todo": 1,
    "completed_percentage": 33.33,
    "in_progress_percentage": 33.33,
    "todo_percentage": 33.33
  }
}
```

### Ticket Creation

#### 7. Create Ticket (Bug or Feature/Story)
**POST** `/api/create-ticket/{project_key}`

**Request Body:**
```json
{
  "summary": "Fix login button not working on mobile",
  "description": "The login button is not responsive on mobile devices. Users cannot tap it to log in.",
  "issue_type": "Bug",
  "priority": "High",
  "assignee": "john.doe@company.com",
  "due_date": "2024-02-15",
  "story_points": 5,
  "epic_link": "PROJ-100",
  "components": ["Frontend", "Mobile"],
  "labels": ["mobile", "urgent"]
}
```

**Request Body for Feature (Story):**
```json
{
  "summary": "Add dark mode support",
  "description": "Implement dark mode theme for better user experience",
  "issue_type": "Feature",
  "priority": "Medium",
  "assignee": "jane.smith@company.com",
  "due_date": "2024-03-01",
  "story_points": 8,
  "epic_link": "PROJ-200",
  "components": ["Frontend", "UI"],
  "labels": ["enhancement", "ui"]
}
```

**Response:**
```json
{
  "success": true,
  "issue_key": "PROJ-130",
  "message": "Bug PROJ-130 created successfully",
  "issue_url": "https://your-jira-instance.atlassian.net/browse/PROJ-130"
}
```

### Backers Management

#### 8. Add Backers to Issue
**POST** `/api/issue/{issue_key}/add-backers`

**Request Body:**
```json
{
  "backers": "user1@company.com, user2@company.com, user3@company.com"
}
```

**Alternative Request Body (array format):**
```json
{
  "backers": ["user1@company.com", "user2@company.com", "user3@company.com"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Backers added to PROJ-130",
  "issue_key": "PROJ-130",
  "total_backers": 5,
  "new_backers_added": 3,
  "all_backers": [
    "creator@company.com",
    "existing.backer@company.com",
    "user1@company.com",
    "user2@company.com",
    "user3@company.com"
  ]
}
```

## Features

- **Authentication**: JIRA API token-based authentication
- **Project Management**: Validate projects and get available statuses
- **Issue Retrieval**: Paginated issue listing with filtering by month
- **Detailed Issue View**: Complete issue details with subtasks and progress tracking
- **Ticket Creation**: Create bugs and feature requests with automatic backer assignment
- **Backer Management**: Add multiple backers to existing issues
- **Progress Tracking**: Automatic calculation of completion percentages for stories with subtasks
- **CORS Support**: Configured for multiple frontend domains

## Custom Fields

- **Visibility**: `customfield_11357` - Set to "Organisation" for all created tickets
- **Backers**: `customfield_11421` - Comma-separated list of email addresses
- **Story Points**: `customfield_10004` - Used for story estimation
- **Epic Link**: `customfield_10008` - Links stories to epics
- **Start Date**: `customfield_10015` - Issue start date

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- `200` - Success
- `401` - Authentication failed
- `404` - Resource not found
- `500` - Internal server error

**Error Response Format:**
```json
{
  "detail": "Error message describing what went wrong"
}
```
