# Complete API Reference for MyAppliedTasks

## Backend Implementation Summary

✅ **TaskApplication Model** - Handles user applications with file submissions  
✅ **Application Controller** - Manages all application-related operations  
✅ **File Upload System** - Supports PDF/DOCX file submissions  
✅ **Authentication Integration** - Protects all routes with JWT authentication  
✅ **Validation Middleware** - Ensures data integrity  
✅ **Error Handling** - Comprehensive error management

---

## API Endpoints

### Authentication Required

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 1. **Apply to Task**

**POST** `/api/applications/apply/:taskId`

Apply to a specific task.

### Request Body

```json
{
  "message": "I'm interested in this task because..." // Optional
}
```

### Response

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "application_id",
    "userId": "user_id",
    "taskId": "task_id",
    "status": "pending",
    "message": "Application message",
    "appliedAt": "2025-01-07T10:30:00.000Z",
    "task": {
      "id": "task_id",
      "title": "Task Title",
      "company": "Company Name",
      "category": "frontend",
      "difficulty": "medium",
      "payout": 300
    }
  }
}
```

---

## 2. **Get My Applied Tasks**

**GET** `/api/applications/my`

Get all tasks the user has applied to.

### Query Parameters

- `status` - Filter by status (pending, accepted, rejected, completed, cancelled, all)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (appliedAt, status, progress, expectedDelivery)
- `sortOrder` - Sort order (asc, desc)

### Example Request

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5001/api/applications/my?status=pending&limit=5"
```

### Response

```json
{
  "success": true,
  "message": "Applied tasks retrieved successfully",
  "data": {
    "applications": [
      {
        "id": "application_id",
        "applicationId": "application_id",
        "status": "pending",
        "appliedAt": "2025-01-07T10:30:00.000Z",
        "message": "Application message",
        "progress": 0,
        "submissionCount": 0,
        "paymentStatus": "pending",
        "daysSinceApplication": 2,
        "daysUntilDeadline": 5,
        "task": {
          "id": "task_id",
          "title": "Build React Component",
          "description": "Create a reusable component...",
          "company": "TechCorp",
          "category": "frontend",
          "difficulty": "medium",
          "payout": 300,
          "duration": 7,
          "status": "open",
          "deadline": "2025-01-15T00:00:00.000Z",
          "client": {
            "id": "client_id",
            "name": "John Client",
            "email": "client@example.com"
          }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalCount": 15,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 3. **Get Application Details**

**GET** `/api/applications/:applicationId`

Get detailed information about a specific application.

### Response

```json
{
  "success": true,
  "message": "Application details retrieved successfully",
  "data": {
    "id": "application_id",
    "status": "accepted",
    "appliedAt": "2025-01-07T10:30:00.000Z",
    "progress": 45,
    "submissionCount": 2,
    "submissions": [
      {
        "id": "submission_id",
        "filename": "user_task_123456.pdf",
        "originalName": "my_work.pdf",
        "size": 1024000,
        "mimetype": "application/pdf",
        "uploadedAt": "2025-01-08T14:20:00.000Z"
      }
    ],
    "task": {
      "id": "task_id",
      "title": "Task Title",
      "description": "Full task description...",
      "requirements": ["React experience", "TypeScript"],
      "skills": ["React", "TypeScript", "CSS"],
      "client": {
        "id": "client_id",
        "name": "John Client",
        "email": "client@example.com"
      }
    }
  }
}
```

---

## 4. **Submit Files**

**POST** `/api/applications/:applicationId/submit`

Submit files for an application (PDF/DOCX only).

### Request

- **Content-Type**: `multipart/form-data`
- **File Field**: `submissions` (supports multiple files)
- **Max Files**: 5 files per submission
- **Max Size**: 10MB per file
- **Allowed Types**: PDF, DOCX, DOC

### Example (JavaScript)

```javascript
const formData = new FormData();
formData.append("submissions", file1);
formData.append("submissions", file2);

fetch("/api/applications/123/submit", {
  method: "POST",
  headers: {
    Authorization: "Bearer <token>",
  },
  body: formData,
});
```

### Response

```json
{
  "success": true,
  "message": "Files submitted successfully",
  "data": {
    "applicationId": "application_id",
    "submittedFiles": [
      {
        "filename": "user_task_123456.pdf",
        "originalName": "my_work.pdf",
        "size": 1024000,
        "mimetype": "application/pdf",
        "uploadedAt": "2025-01-08T14:20:00.000Z"
      }
    ],
    "totalSubmissions": 3,
    "progress": 25
  }
}
```

---

## 5. **Update Progress**

**PUT** `/api/applications/:applicationId/progress`

Update the progress of an application (0-100).

### Request Body

```json
{
  "progress": 75
}
```

### Response

```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "applicationId": "application_id",
    "progress": 75
  }
}
```

---

## 6. **Withdraw Application**

**DELETE** `/api/applications/:applicationId/withdraw`

Withdraw a pending or accepted application.

### Response

```json
{
  "success": true,
  "message": "Application withdrawn successfully",
  "data": {
    "applicationId": "application_id",
    "status": "cancelled"
  }
}
```

---

## 7. **Get Application Statistics**

**GET** `/api/applications/my/stats`

Get user's application statistics.

### Response

```json
{
  "success": true,
  "message": "Application statistics retrieved successfully",
  "data": {
    "totalApplications": 15,
    "pendingApplications": 3,
    "acceptedApplications": 5,
    "completedApplications": 4,
    "rejectedApplications": 2,
    "totalSubmissions": 12,
    "averageProgress": 68,
    "successRate": 60.0
  }
}
```

---

## 8. **Delete Submission File**

**DELETE** `/api/applications/:applicationId/submissions/:submissionId`

Delete a specific submitted file.

### Response

```json
{
  "success": true,
  "message": "Submission file deleted successfully",
  "data": {
    "applicationId": "application_id",
    "deletedSubmissionId": "submission_id",
    "remainingSubmissions": 2
  }
}
```

---

## Frontend Integration

### Setup Authentication

```javascript
import enhancedTaskAPI from "./api/enhancedTaskAPI";

// Set token after login
const token = localStorage.getItem("authToken");
enhancedTaskAPI.setToken(token);

// Check authentication
if (!enhancedTaskAPI.isAuthenticated()) {
  // Redirect to login
  window.location.href = "/login";
}
```

### Get Applied Tasks

```javascript
const loadAppliedTasks = async () => {
  try {
    const data = await enhancedTaskAPI.getMyAppliedTasks({
      status: "pending",
      limit: 10,
      page: 1,
    });
    setAppliedTasks(data.applications);
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### Submit Files

```javascript
const handleFileSubmission = async (applicationId, files) => {
  try {
    const result = await enhancedTaskAPI.submitFiles(applicationId, files);
    console.log("Files submitted:", result);
  } catch (error) {
    console.error("Error submitting files:", error);
  }
};
```

### Apply to Task

```javascript
const handleApply = async (taskId, message) => {
  try {
    await enhancedTaskAPI.applyToTask(taskId, message);
    alert("Application submitted successfully!");
  } catch (error) {
    console.error("Error applying:", error);
  }
};
```

---

## Error Handling

### Common Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

### Authentication Errors

- **401 Unauthorized**: Token missing or invalid
- **403 Forbidden**: User doesn't have permission

### Validation Errors

- **400 Bad Request**: Invalid input data
- **422 Unprocessable Entity**: Validation failed

### File Upload Errors

- **400 Bad Request**: Invalid file type or size
- **413 Payload Too Large**: File too large

---

## File Storage

### Upload Directory Structure

```
uploads/
├── profile-images/     # User profile images
└── submissions/        # Task submission files
    ├── userId-taskId-timestamp.pdf
    └── userId-taskId-timestamp.docx
```

### File Naming Convention

- **Format**: `{userId}-{taskId}-{timestamp}.{extension}`
- **Example**: `507f1f77bcf86cd799439011-507f191e810c19729de860ea-1641234567890.pdf`

---

## Database Models

### TaskApplication Schema

```javascript
{
  userId: ObjectId,           // Reference to User
  taskId: ObjectId,           // Reference to Task
  status: String,             // pending, accepted, rejected, completed, cancelled
  appliedAt: Date,            // When application was submitted
  message: String,            // Application message
  submissions: [{             // Array of submitted files
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: Date
  }],
  progress: Number,           // 0-100
  paymentStatus: String,      // pending, paid, disputed
  expectedDelivery: Date,     // Expected completion date
  feedback: {                 // Client feedback
    rating: Number,
    comment: String,
    providedAt: Date
  }
}
```

---

## Backend Status

✅ **All endpoints implemented and tested**  
✅ **File upload system working** (PDF/DOCX support)  
✅ **Authentication integration complete**  
✅ **Database models created**  
✅ **Validation middleware implemented**  
✅ **Error handling comprehensive**  
✅ **Frontend integration examples provided**

### Ready for Frontend Integration!

The backend is fully functional and ready to be integrated with your frontend MyAppliedTasks component. All endpoints are protected with authentication, and the file upload system supports the required PDF/DOCX formats.
