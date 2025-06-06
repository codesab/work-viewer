
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

#### 4. Get Project Issue Types
**GET** `/api/project/{project_key}/issue-types`

**Example:** `GET /api/project/PROJ/issue-types`

**Response:**
```json
{
  "issue_types": [
    {
      "id": "10001",
      "name": "Bug",
      "description": "A problem which impairs or prevents the functions of the product."
    },
    {
      "id": "10002",
      "name": "Story",
      "description": "A user story. Created by JIRA Software - do not edit or delete."
    },
    {
      "id": "10003",
      "name": "Task",
      "description": "A task that needs to be done."
    }
  ]
}
```

#### 5. Get Project Statuses
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

### Custom Field Management

#### 6. Get Custom Field Values
**GET** `/api/custom-field/{field_id}/values`

**Example:** `GET /api/custom-field/customfield_11357/values`

**Response:**
```json
{
  "field_id": "customfield_11357",
  "field_name": "Visibility",
  "field_type": "option",
  "values": [
    {
      "id": "10001",
      "value": "Organisation",
      "disabled": false
    },
    {
      "id": "10002",
      "value": "Public",
      "disabled": false
    }
  ],
  "default_value": {
    "id": "10001",
    "value": "Organisation",
    "disabled": false
  },
  "total_count": 2
}
```

### Issue Management

#### 7. Get Issues (with Pagination and Filtering)
**GET** `/api/issues/{project_key}`

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `size` (int, default: 10) - Items per page
- `sort_by` (str, default: "key") - Sort field
- `sort_order` (str, default: "asc") - Sort order (asc/desc)
- `month` (str, optional) - Filter by month (YYYY-MM format)
- `search` (optional): Search term to filter issues by summary

**Example:** `GET /api/issues/PROJ?page=1&size=5&sort_by=key&sort_order=desc&month=2024-01&search=authentication`

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

#### 8. Get Issue Details with Subtasks and Progress
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

#### 9. Create Ticket (Bug or Feature/Story)
**POST** `/api/create-ticket/{project_key}`

**Request Body (using issue type object - recommended):**
```json
{
  "summary": "Fix login button not working on mobile",
  "description": "The login button is not responsive on mobile devices. Users cannot tap it to log in.",
  "issue_type": {
    "id": "10001",
    "name": "Bug"
  },
  "assignee": "john.doe@company.com",
  "due_date": "2024-02-15",
  "story_points": 5,
  "epic_link": "PROJ-100",
  "components": ["Frontend", "Mobile"],
  "labels": ["mobile", "urgent"],
  "backer": "creator@company.com"
}
```

**Request Body (using issue type string - legacy):**
```json
{
  "summary": "Add dark mode support",
  "description": "Implement dark mode theme for better user experience",
  "issue_type": "Story",
  "assignee": "jane.smith@company.com",
  "due_date": "2024-03-01",
  "story_points": 8,
  "epic_link": "PROJ-200",
  "components": ["Frontend", "UI"],
  "labels": ["enhancement", "ui"],
  "backer": "creator@company.com"
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

#### 10. Add Backers to Issue
**POST** `/api/issue/{issue_key}/add-backers`

**Request Body (single email):**
```json
{
  "backers": "user@company.com"
}
```

**Request Body (comma-separated emails):**
```json
{
  "backers": "user1@company.com, user2@company.com, user3@company.com"
}
```

**Request Body (array format):**
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
  "new_backers_added": "user1@company.com\nuser2@company.com\nuser3@company.com",
  "final_backers": "existing.backer@company.com\nuser1@company.com\nuser2@company.com\nuser3@company.com"
}
```

## Features

- **Authentication**: JIRA API token-based authentication
- **Project Management**: Validate projects and get available statuses
- **Issue Retrieval**: Paginated issue listing with filtering by month and search
- **Detailed Issue View**: Complete issue details with subtasks and progress tracking
- **Ticket Creation**: Create bugs and feature requests with automatic field handling
- **Backer Management**: Add multiple backers to existing issues
- **Progress Tracking**: Automatic calculation of completion percentages for stories with subtasks
- **CORS Support**: Configured for multiple frontend domains
- **Dynamic Field Handling**: Automatically fetches and uses available field values
- **Fallback Values**: Uses sensible defaults when fields are unavailable

## Custom Fields

- **Visibility**: `customfield_11357` - Dynamically fetches first available option (fallback: "Organisation")
- **Backers**: `customfield_11421` - Text field for storing backer email addresses
- **Story Points**: `customfield_10004` - Used for story estimation
- **Epic Link**: `customfield_10008` - Links stories to epics
- **Start Date**: `customfield_10015` - Issue start date

## Smart Field Management

The API automatically handles field availability issues by:

1. **Dynamic Visibility Field**: Fetches available options from `customfield_11357` and uses the first available value
2. **Dynamic Priority**: Attempts to use "Medium" priority, falls back to the first available priority if Medium is unavailable
3. **Field Validation**: Skips fields that are not available on the current issue type screen
4. **Graceful Degradation**: Continues ticket creation even if some optional fields fail

This ensures robust ticket creation across different JIRA configurations and project setups.

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
