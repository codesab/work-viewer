
# JIRA Ticket Dashboard

A dashboard to view and manage JIRA tickets within the organization.

## Project Structure
```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── config.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    └── package.json
```

## Setup
1. Install backend dependencies: `pip install -r requirements.txt`
2. Install frontend dependencies: `npm install`
3. Configure environment variables
4. Run backend: `uvicorn backend.app.main:app --reload`
5. Run frontend: `npm run dev`
