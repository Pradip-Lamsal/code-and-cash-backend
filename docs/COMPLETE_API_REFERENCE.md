# Backend API Reference

## Available Endpoints

Your backend provides all the required endpoints for task management:

---

## 1. **GET /api/tasks** - Get Tasks with Filtering

**URL:** `http://localhost:5001/api/tasks`

### Query Parameters (All Optional)

- `category` - Filter by category (frontend, backend, fullstack, mobile, design, devops)
- `difficulty` - Filter by difficulty (easy, medium, hard)
- `search` - Search in title, description, company, skills
- `minPayout` - Minimum payout amount
- `maxPayout` - Maximum payout amount
- `status` - Filter by status (open, in_progress, completed, cancelled)
- `featured` - Filter featured tasks (true/false)
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 10)

### Example Requests

```bash
# Get all tasks
curl http://localhost:5001/api/tasks

# Filter by category
curl http://localhost:5001/api/tasks?category=frontend

# Filter by difficulty
curl http://localhost:5001/api/tasks?difficulty=hard

# Search tasks
curl http://localhost:5001/api/tasks?search=react

# Filter by payout range
curl http://localhost:5001/api/tasks?minPayout=200&maxPayout=500

# Combine filters
curl http://localhost:5001/api/tasks?category=backend&difficulty=medium&minPayout=300
```

### Response Format

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "id": "6867ce6694f5905d404d18e4",
        "title": "DevOps Pipeline Setup",
        "description": "Set up a complete CI/CD pipeline...",
        "company": "CloudTech",
        "category": "devops",
        "difficulty": "hard",
        "payout": 500,
        "duration": 8,
        "status": "open",
        "skills": ["DevOps", "GitHub Actions", "Docker", "AWS"],
        "requirements": ["DevOps experience", "CI/CD pipeline setup"],
        "tags": ["DevOps", "CI/CD", "Docker", "AWS"],
        "createdAt": "2025-07-04T12:51:50.035Z",
        "updatedAt": "2025-07-04T12:51:50.035Z",
        "featured": true,
        "client": {
          "_id": "685a930e4c6c5586823fe4f5",
          "name": "Pradip Lamsal",
          "email": "pradiplamsal@gmail.com"
        },
        "applicants": [],
        "applicantCount": 0,
        "daysUntilDeadline": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 10,
      "hasNext": false,
      "hasPrev": false,
      "nextPage": null,
      "prevPage": null
    }
  }
}
```

---

## 2. **GET /api/tasks/categories** - Get All Categories

**URL:** `http://localhost:5001/api/tasks/categories`

### Response Format

```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "frontend",
      "label": "Frontend Development",
      "icon": "🎨",
      "description": "UI/UX, React, Vue, Angular, HTML/CSS",
      "count": 2,
      "averagePayout": 200,
      "minPayout": 150,
      "maxPayout": 250
    },
    {
      "id": "backend",
      "label": "Backend Development",
      "icon": "⚙️",
      "description": "APIs, databases, server-side logic",
      "count": 3,
      "averagePayout": 283,
      "minPayout": 200,
      "maxPayout": 350
    },
    {
      "id": "fullstack",
      "label": "Full Stack Development",
      "icon": "🔄",
      "description": "End-to-end application development",
      "count": 1,
      "averagePayout": 800,
      "minPayout": 800,
      "maxPayout": 800
    },
    {
      "id": "mobile",
      "label": "Mobile Development",
      "icon": "📱",
      "description": "iOS, Android, React Native, Flutter",
      "count": 2,
      "averagePayout": 250,
      "minPayout": 100,
      "maxPayout": 400
    },
    {
      "id": "design",
      "label": "Design",
      "icon": "🎨",
      "description": "UI/UX design, graphics, branding",
      "count": 1,
      "averagePayout": 300,
      "minPayout": 300,
      "maxPayout": 300
    },
    {
      "id": "devops",
      "label": "DevOps",
      "icon": "🚀",
      "description": "CI/CD, cloud infrastructure, deployment",
      "count": 1,
      "averagePayout": 500,
      "minPayout": 500,
      "maxPayout": 500
    }
  ]
}
```

---

## 3. **GET /api/tasks/difficulties** - Get All Difficulties

**URL:** `http://localhost:5001/api/tasks/difficulties`

### Response Format

```json
{
  "success": true,
  "message": "Difficulties retrieved successfully",
  "data": [
    {
      "id": "easy",
      "label": "Easy",
      "color": "text-green-500",
      "description": "Beginner-friendly tasks",
      "estimatedHours": "5-20 hours",
      "count": 2,
      "averagePayout": 125,
      "minPayout": 100,
      "maxPayout": 150
    },
    {
      "id": "medium",
      "label": "Medium",
      "color": "text-yellow-500",
      "description": "Intermediate level tasks",
      "estimatedHours": "20-50 hours",
      "count": 4,
      "averagePayout": 288,
      "minPayout": 200,
      "maxPayout": 400
    },
    {
      "id": "hard",
      "label": "Hard",
      "color": "text-red-500",
      "description": "Advanced and complex tasks",
      "estimatedHours": "50+ hours",
      "count": 4,
      "averagePayout": 488,
      "minPayout": 300,
      "maxPayout": 800
    }
  ]
}
```

---

## Additional Endpoints

### 4. **GET /api/tasks/stats** - Get Statistics

```bash
curl http://localhost:5001/api/tasks/stats
```

### 5. **GET /api/tasks/price-range** - Get Price Range

```bash
curl http://localhost:5001/api/tasks/price-range
```

### 6. **GET /api/tasks/:id** - Get Single Task

```bash
curl http://localhost:5001/api/tasks/6867ce6694f5905d404d18e4
```

---

## Backend Status

✅ **Backend is running** on `http://localhost:5001`  
✅ **All endpoints are working**  
✅ **Data is available** (10 sample tasks)  
✅ **CORS is configured** for frontend access  
✅ **No authentication required**

**Test your API**: http://localhost:5001/api-test.html
