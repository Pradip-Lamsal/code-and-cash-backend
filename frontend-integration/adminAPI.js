// Admin API Utility for Frontend Integration
// Copy this file to your frontend project to handle admin operations

class AdminAPI {
  constructor() {
    this.baseURL = "http://localhost:5001/api";
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem("adminToken", token);
  }

  // Get token from localStorage on initialization
  initializeToken() {
    const token = localStorage.getItem("adminToken");
    if (token) {
      this.token = token;
      return true;
    }
    return false;
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem("adminToken");
  }

  // Helper method to handle API requests with authentication
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add authentication token if available
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Admin API request failed:", error);
      throw error;
    }
  }

  // Check if user has admin access
  async checkAdminAccess() {
    try {
      const response = await this.request("/admin/check-access");
      return {
        isAdmin: true,
        user: response.data.user,
      };
    } catch (error) {
      console.error("Admin access check failed:", error);
      return {
        isAdmin: false,
        error: error.message,
      };
    }
  }

  // Get admin dashboard stats
  async getStats() {
    const response = await this.request("/admin/stats");
    return response.data;
  }

  // Get all users (paginated)
  async getUsers(page = 1, limit = 10) {
    const response = await this.request(
      `/admin/users?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  // Delete a user
  async deleteUser(userId) {
    const response = await this.request(`/admin/users/${userId}`, {
      method: "DELETE",
    });
    return response;
  }

  // Get all tasks (paginated)
  async getTasks(page = 1, limit = 10) {
    const response = await this.request(
      `/admin/tasks?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  // Create a new task
  async createTask(taskData) {
    const response = await this.request("/admin/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
    return response.data;
  }

  // Delete a task
  async deleteTask(taskId) {
    const response = await this.request(`/admin/tasks/${taskId}`, {
      method: "DELETE",
    });
    return response;
  }

  // Get all task applications
  async getTaskApplications() {
    const response = await this.request("/admin/task-applications");
    return response.data;
  }

  // Update application status (approve/reject)
  async updateApplicationStatus(applicationId, status, feedback) {
    const response = await this.request(
      `/admin/applications/${applicationId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, feedback }),
      }
    );
    return response;
  }

  // Get user submissions
  async getUserSubmissions(userId) {
    const response = await this.request(`/admin/user-submissions/${userId}`);
    return response.data;
  }

  // Update submission status
  async updateSubmissionStatus(submissionId, status, feedback) {
    const response = await this.request(
      `/admin/submissions/${submissionId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, feedback }),
      }
    );
    return response;
  }

  // Helper function to download a submission file
  downloadSubmissionFile(submissionId) {
    if (!this.token) {
      throw new Error("Authentication required");
    }

    // Create a link to trigger download
    const downloadUrl = `${this.baseURL}/admin/submissions/${submissionId}/download`;
    const link = document.createElement("a");
    link.href = downloadUrl;

    // Add authentication header through a fetch and blob
    fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = `submission-${submissionId}`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Download failed:", error);
        throw error;
      });
  }

  // Aliases for compatibility with different naming conventions
  getAllUsers(page = 1, limit = 10) {
    return this.getUsers(page, limit);
  }

  getAllTasks(page = 1, limit = 10) {
    return this.getTasks(page, limit);
  }

  getAllTaskApplications() {
    return this.getTaskApplications();
  }
}

// Create and export a single instance
const adminAPI = new AdminAPI();
export default adminAPI;
