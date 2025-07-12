# Frontend Guide to Backend Task Details

This guide provides an overview of the backend structure and instructions for frontend developers to fetch task details, validate data, and understand the backend logic related to tasks.

---

## Backend Structure Overview

The backend is organized into the following key directories:

- **`src/models/`**: Contains Mongoose models, including `Task.js` which defines the schema and methods for tasks.
- **`src/controllers/`**: Contains controllers that handle business logic for various entities.
- **`src/routes/`**: Defines API endpoints and maps them to controllers.
- **`src/middlewares/`**: Includes middleware for validation, authentication, and error handling.
- **`src/services/`**: Contains utility services like token management.
- **`src/utils/`**: Includes helper functions like error handling and logging.

---

## Task Model (`Task.js`)

The `Task` model is defined in `src/models/Task.js`. It includes the following key fields:

- **Basic Fields**: `title`, `description`, `company`, `category`, `difficulty`, `payout`, `duration`, `status`.
- **Relationships**: `clientId` (references the user who created the task), `applicants`, `submissions`, `assignedTo`.
- **Additional Fields**: `requirements`, `skills`, `tags`, `attachments`, `isActive`, `deadline`.

### Key Methods and Middleware

- **Static Methods**:
  - `getTaskStats()`: Fetches overall task statistics.
  - `getCategoryStats()`: Fetches statistics grouped by category.
- **Instance Methods**:
  - `canUserApply(userId)`: Checks if a user can apply for a task.
- **Middleware**:
  - Logs errors during `save` and `findOneAndUpdate` operations.

---

## Fetching Task Details

To fetch task details, use the following API endpoint:

### Endpoint: `GET /api/tasks/:id`

- **Description**: Fetches details of a specific task by its MongoDB ObjectId.
- **Request Parameters**:
  - `id` (Path Parameter): The MongoDB ObjectId of the task to fetch (24 hexadecimal characters).
- **Response**:

  ```json
  {
    "task": {
      "_id": "<task_id>",
      "title": "<task_title>",
      "company": "<company_name>",
      "companyLogo": "<company_initials>",
      "postedDate": "<formatted_date>",
      "deadline": "<time_remaining>",
      "location": "Remote",
      "estimatedTime": "<duration> days",
      "applicants": "<count> developers",
      "payout": <payout_amount>,
      "difficulty": "<Easy|Medium|Hard>",
      "urgency": "<High|Medium>",
      "category": "<Category>",
      "overview": "<task_description>",
      "requirements": ["<requirement1>", "<requirement2>"],
      "deliverables": ["Complete source code", "Documentation", "Testing and quality assurance"],
      "requiredSkills": ["<skill1>", "<skill2>"],
      "benefits": ["Work with cutting-edge technology", "Flexible working hours", "Portfolio addition", "Professional development"]
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Invalid task ID format
  - `404 Not Found`: Task not found

---

## Validation Logic

The `Task` model includes validation rules for all fields. Key validations include:

- **Title**: Required, max length 100 characters.
- **Description**: Required, max length 1000 characters.
- **Company**: Required, max length 50 characters.
- **Category**: Must be one of `frontend`, `backend`, `fullstack`, `mobile`, `design`, `devops`.
- **Difficulty**: Must be one of `easy`, `medium`, `hard`.
- **Payout**: Must be between 0 and 10,000.
- **Duration**: Must be between 1 and 365 days.
- **Deadline**: Must be in the future.

---

## Example: Fetching Task Details in Frontend

Here is an example of how to fetch task details using `fetch` in JavaScript:

```javascript
const fetchTaskDetails = async (taskId) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`);
    if (!response.ok) {
      throw new Error(`Error fetching task: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Task Details:", data.task);
  } catch (error) {
    console.error("Failed to fetch task details:", error);
  }
};

// Example usage with a MongoDB ObjectId
fetchTaskDetails("6872c223ce150d6ca8118609");
```

---

## Additional Notes

- **Error Handling**: The backend logs validation errors during `save` and `update` operations. Check the server logs for details.
- **Indexes**: The `Task` model includes indexes for better query performance on fields like `category`, `difficulty`, `status`, and `payout`.
- **Virtual Fields**:
  - `applicantCount`: Returns the number of applicants for a task.
  - `daysUntilDeadline`: Returns the number of days remaining until the deadline.

---

For further details, refer to the backend documentation or contact the backend team.
