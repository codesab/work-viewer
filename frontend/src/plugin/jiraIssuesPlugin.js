
class JiraIssuesPlugin {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      projectKey: options.projectKey || 'PHNX',
      baseUrl: options.baseUrl || window.location.hostname,
      ...options
    };
    this.state = {
      issues: null,
      error: null,
      loading: false,
      issueType: 'Story',
      page: 1,
      pageSize: 10,
      searchText: '',
      selectedStatuses: [],
      availableStatuses: []
    };
  }

  async init() {
    await this.loadStyles();
    await this.fetchStatuses();
    await this.fetchIssues();
    this.render();
  }

  async loadStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/antd/dist/antd.min.css';
    document.head.appendChild(link);
  }

  async fetchStatuses() {
    try {
      const response = await fetch(
        `https://${this.options.baseUrl}/api/statuses/${this.options.projectKey}`
      );
      const data = await response.json();
      if (response.ok) {
        this.state.availableStatuses = data.statuses;
      }
    } catch (err) {
      console.error("Failed to fetch statuses:", err);
    }
  }

  async fetchIssues() {
    this.state.loading = true;
    this.render();
    
    try {
      const response = await fetch(
        `https://${this.options.baseUrl}/api/issues/${this.options.projectKey}?issue_type=${this.state.issueType}&page=${this.state.page}&size=${this.state.pageSize}`
      );
      const data = await response.json();
      if (response.ok) {
        this.state.issues = data;
        this.state.error = null;
      } else {
        this.state.error = data.detail;
      }
    } catch (err) {
      this.state.error = err.message;
    } finally {
      this.state.loading = false;
      this.render();
    }
  }

  getFilteredIssues() {
    if (!this.state.issues?.items) return [];
    return this.state.issues.items.filter(issue => {
      const searchLower = this.state.searchText.toLowerCase();
      const matchesSearch = 
        issue.key.toLowerCase().includes(searchLower) ||
        issue.title.toLowerCase().includes(searchLower);
      const matchesStatus = this.state.selectedStatuses.length === 0 || 
        this.state.selectedStatuses.includes(issue.status);
      return matchesSearch && matchesStatus;
    });
  }

  render() {
    const filteredIssues = this.getFilteredIssues();
    
    this.container.innerHTML = `
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <h2>Product and Engineering Backlog 🚀</h2>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
            <input 
              type="text" 
              placeholder="Search by key or summary" 
              style="width: 300px; padding: 8px;"
              value="${this.state.searchText}"
              class="search-input"
            />
            
            <div>
              <span>Issue Type:</span>
              <select class="issue-type-select" style="margin: 0 10px;">
                <option value="Story" ${this.state.issueType === 'Story' ? 'selected' : ''}>Story</option>
                <option value="Task" ${this.state.issueType === 'Task' ? 'selected' : ''}>Task</option>
              </select>
              
              <select class="status-select" multiple style="width: 200px;">
                ${this.state.availableStatuses.map(status => `
                  <option value="${status}" ${this.state.selectedStatuses.includes(status) ? 'selected' : ''}>
                    ${status}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        ${this.state.error ? `<div class="error">${this.state.error}</div>` : ''}
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Key</th>
              <th>Summary</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Assignee</th>
              <th>Reporter</th>
            </tr>
          </thead>
          <tbody>
            ${filteredIssues.map(issue => `
              <tr>
                <td>${issue.key}</td>
                <td>${issue.title}</td>
                <td>${issue.status}</td>
                <td>${issue.start_date || 'Not set'}</td>
                <td>${issue.due_date || 'Not set'}</td>
                <td>${issue.assignee || 'Unassigned'}</td>
                <td>${issue.reporter}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const searchInput = this.container.querySelector('.search-input');
    const issueTypeSelect = this.container.querySelector('.issue-type-select');
    const statusSelect = this.container.querySelector('.status-select');

    searchInput?.addEventListener('input', (e) => {
      this.state.searchText = e.target.value;
      this.render();
    });

    issueTypeSelect?.addEventListener('change', (e) => {
      this.state.issueType = e.target.value;
      this.fetchIssues();
    });

    statusSelect?.addEventListener('change', (e) => {
      this.state.selectedStatuses = Array.from(e.target.selectedOptions).map(option => option.value);
      this.render();
    });
  }
}

// Export for both ESM and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JiraIssuesPlugin;
} else {
  window.JiraIssuesPlugin = JiraIssuesPlugin;
}
