# API Reference

## Endpoints

### 1. GET /api/tasks

Returns tasks with optional filtering.

**Query Parameters:**

- `category` - frontend, backend, fullstack, mobile, design, devops
- `difficulty` - easy, medium, hard
- `search` - Search text
- `minPayout` - Minimum payout amount
- `maxPayout` - Maximum payout amount
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**

```
GET /api/tasks?category=frontend&difficulty=easy
```

### 2. GET /api/tasks/categories

Returns available task categories.

### 3. GET /api/tasks/difficulties

Returns available task difficulties.

### 4. GET /api/tasks/stats

Returns task statistics.

### 5. GET /api/tasks/:id

Returns single task by ID.

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Description",
  "data": {
    /* Response data */
  }
}
```

## Server Info

- **URL:** http://localhost:5001
- **CORS:** Enabled
- **Auth:** Not required for tasks endpoints
