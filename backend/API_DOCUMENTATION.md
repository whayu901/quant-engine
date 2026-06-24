# Qual Engine API Documentation

## Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.qualengine.com/api/v1
```

## Authentication
All API endpoints (except auth endpoints) require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Users](#users-endpoints)
3. [Organizations](#organizations-endpoints)
4. [Projects](#projects-endpoints)
5. [Transcripts](#transcripts-endpoints)
6. [Analysis](#analysis-endpoints)
7. [Analysis Grid](#analysis-grid-endpoints)
8. [Collaboration](#collaboration-endpoints)
9. [Statistical Analysis](#statistical-analysis-endpoints)
10. [Enterprise](#enterprise-endpoints)
11. [WebSocket](#websocket-endpoints)

---

## Authentication Endpoints

### Register User
`POST /auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "organization_name": "Acme Corp"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "organization_id": "uuid",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Login
`POST /auth/login`

Authenticate and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Refresh Token
`POST /auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

## Users Endpoints

### Get Current User
`GET /users/me`

Get authenticated user's profile.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "researcher",
  "organization": {
    "id": "uuid",
    "name": "Acme Corp",
    "plan": "enterprise"
  }
}
```

### Update Profile
`PUT /users/me`

Update user profile information.

**Request Body:**
```json
{
  "full_name": "Jane Doe",
  "timezone": "Asia/Singapore",
  "language": "en"
}
```

---

## Organizations Endpoints

### Get Organization
`GET /organizations/{org_id}`

Get organization details.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "plan": "enterprise",
  "created_at": "2024-01-01T00:00:00Z",
  "settings": {
    "default_language": "en",
    "timezone": "Asia/Singapore"
  }
}
```

### List Organization Members
`GET /organizations/{org_id}/members`

Get all members of an organization.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20)

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "admin",
      "joined_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "pages": 1
}
```

---

## Projects Endpoints

### List Projects
`GET /projects`

Get all projects accessible to the user.

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `status` (string): Filter by status (active, archived, completed)
- `search` (string): Search in project names

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Customer Feedback Analysis Q1",
      "description": "Analysis of Q1 customer feedback",
      "status": "active",
      "created_at": "2024-01-15T00:00:00Z",
      "members_count": 5,
      "transcripts_count": 25
    }
  ],
  "total": 15,
  "page": 1,
  "pages": 2
}
```

### Create Project
`POST /projects`

Create a new project.

**Request Body:**
```json
{
  "name": "New Research Project",
  "description": "Detailed description",
  "settings": {
    "languages": ["en", "id"],
    "timezone": "Asia/Jakarta",
    "currency": "IDR"
  }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Research Project",
  "description": "Detailed description",
  "status": "active",
  "created_at": "2024-01-20T00:00:00Z"
}
```

### Update Project
`PUT /projects/{project_id}`

Update project details.

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "active"
}
```

### Delete Project
`DELETE /projects/{project_id}`

Delete a project and all associated data.

**Response (204):** No content

---

## Transcripts Endpoints

### List Transcripts
`GET /projects/{project_id}/transcripts`

Get all transcripts in a project.

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `language` (string): Filter by language

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Interview #1",
      "participant_id": "P001",
      "duration": 3600,
      "language": "en",
      "created_at": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 2
}
```

### Upload Transcript
`POST /projects/{project_id}/transcripts`

Upload a new transcript file.

**Request Body (multipart/form-data):**
- `file`: Audio/video file or text document
- `title`: Transcript title
- `participant_id`: Participant identifier
- `language`: Language code

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Interview #1",
  "status": "processing",
  "job_id": "uuid"
}
```

### Get Transcript
`GET /transcripts/{transcript_id}`

Get transcript details and content.

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Interview #1",
  "content": "Full transcript text...",
  "segments": [
    {
      "start": 0.0,
      "end": 5.5,
      "text": "Hello, thank you for joining.",
      "speaker": "Interviewer"
    }
  ],
  "metadata": {
    "duration": 3600,
    "word_count": 5000,
    "language": "en"
  }
}
```

---

## Analysis Endpoints

### Create Analysis
`POST /projects/{project_id}/analyses`

Create a new analysis.

**Request Body:**
```json
{
  "name": "Thematic Analysis",
  "type": "thematic",
  "transcript_ids": ["uuid1", "uuid2"],
  "settings": {
    "auto_code": true,
    "language": "en"
  }
}
```

### Get Analysis Results
`GET /analyses/{analysis_id}`

Get analysis results.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Thematic Analysis",
  "status": "completed",
  "themes": [
    {
      "id": "uuid",
      "name": "Customer Satisfaction",
      "description": "Themes related to satisfaction",
      "frequency": 45,
      "prevalence": 0.75,
      "quotes": [
        {
          "text": "The service was excellent",
          "transcript_id": "uuid",
          "participant": "P001"
        }
      ]
    }
  ],
  "statistics": {
    "total_codes": 150,
    "unique_themes": 12,
    "coverage": 0.85
  }
}
```

### Generate AI Insights
`POST /analyses/{analysis_id}/insights`

Generate AI-powered insights.

**Request Body:**
```json
{
  "type": "summary",
  "focus_areas": ["pain_points", "recommendations"],
  "language": "en"
}
```

**Response (200):**
```json
{
  "insights": [
    {
      "type": "pain_point",
      "title": "Long Wait Times",
      "description": "Customers frequently mention...",
      "evidence_count": 23,
      "confidence": 0.92
    }
  ],
  "recommendations": [
    {
      "title": "Improve Response Time",
      "description": "Based on analysis...",
      "priority": "high",
      "impact": "high"
    }
  ]
}
```

---

## Analysis Grid Endpoints

### Create Grid
`POST /projects/{project_id}/grids`

Create an analysis grid.

**Request Body:**
```json
{
  "name": "Market Comparison Grid",
  "type": "comparison",
  "markets": ["SG", "ID", "MY"],
  "columns": [
    {"name": "Features", "type": "text"},
    {"name": "Price Perception", "type": "rating"},
    {"name": "Purchase Intent", "type": "percentage"}
  ]
}
```

### Update Grid Cell
`PUT /grids/{grid_id}/cells`

Update a cell in the grid.

**Request Body:**
```json
{
  "row_id": "uuid",
  "column_id": "uuid",
  "value": "Updated content",
  "metadata": {
    "confidence": 0.85,
    "source": "Interview #5"
  }
}
```

### Export Grid
`GET /grids/{grid_id}/export`

Export grid to various formats.

**Query Parameters:**
- `format` (string): excel, csv, json

**Response:** File download

---

## Collaboration Endpoints

### Get Active Sessions
`GET /projects/{project_id}/sessions`

Get active collaboration sessions.

**Response (200):**
```json
{
  "sessions": [
    {
      "user_id": "uuid",
      "user_name": "John Doe",
      "status": "active",
      "location": "Analysis Grid",
      "cursor_position": {"row": 5, "col": 3},
      "last_activity": "2024-01-20T10:30:00Z"
    }
  ]
}
```

### Add Comment
`POST /projects/{project_id}/comments`

Add a comment to project element.

**Request Body:**
```json
{
  "target_type": "grid_cell",
  "target_id": "uuid",
  "content": "This needs review",
  "parent_id": null
}
```

### Get Activity Feed
`GET /projects/{project_id}/activity`

Get project activity feed.

**Query Parameters:**
- `limit` (int): Number of activities
- `since` (datetime): Activities since timestamp

**Response (200):**
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "grid_updated",
      "user": "John Doe",
      "description": "Updated cell in Market Comparison Grid",
      "timestamp": "2024-01-20T10:00:00Z",
      "details": {
        "grid_id": "uuid",
        "cell": {"row": 5, "col": 3}
      }
    }
  ]
}
```

---

## Statistical Analysis Endpoints

### Calculate Inter-rater Reliability
`POST /analyses/{analysis_id}/statistics/irr`

Calculate Cohen's Kappa for coding agreement.

**Request Body:**
```json
{
  "rater1_codes": ["uuid1", "uuid2"],
  "rater2_codes": ["uuid1", "uuid3"]
}
```

**Response (200):**
```json
{
  "cohens_kappa": 0.75,
  "agreement_percentage": 0.85,
  "interpretation": "substantial",
  "confusion_matrix": {
    "agreed": 85,
    "disagreed": 15
  }
}
```

### Get Code Co-occurrence
`GET /analyses/{analysis_id}/statistics/cooccurrence`

Get code co-occurrence matrix.

**Response (200):**
```json
{
  "matrix": [
    {
      "code1": "satisfaction",
      "code2": "loyalty",
      "frequency": 23,
      "jaccard_similarity": 0.65
    }
  ],
  "visualization_url": "/api/v1/visualizations/uuid"
}
```

### Detect Code Mixing
`POST /analyses/{analysis_id}/statistics/code-mixing`

Detect language code-mixing in transcripts.

**Request Body:**
```json
{
  "transcript_ids": ["uuid1", "uuid2"],
  "languages": ["en", "id", "ms"]
}
```

**Response (200):**
```json
{
  "results": [
    {
      "transcript_id": "uuid",
      "mixing_detected": true,
      "primary_language": "en",
      "mixed_languages": ["id"],
      "mixing_ratio": 0.15,
      "examples": [
        "The service was bagus sekali"
      ]
    }
  ]
}
```

---

## Enterprise Endpoints

### Get White-Label Config
`GET /enterprise/white-label`

Get white-label configuration.

**Response (200):**
```json
{
  "brand_name": "Custom Research Platform",
  "logo_url": "https://...",
  "primary_color": "#1976D2",
  "secondary_color": "#424242",
  "custom_domain": "research.company.com"
}
```

### Update White-Label Config
`PUT /enterprise/white-label`

Update white-label settings (admin only).

**Request Body:**
```json
{
  "brand_name": "New Brand",
  "primary_color": "#2196F3",
  "favicon_url": "https://..."
}
```

### Export Data
`POST /enterprise/export`

Export organization data.

**Request Body:**
```json
{
  "format": "json",
  "include": ["projects", "analyses", "users"],
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "anonymize_pii": true
}
```

**Response (202):**
```json
{
  "job_id": "uuid",
  "status": "processing",
  "estimated_completion": "2024-01-20T11:00:00Z"
}
```

### Import Data
`POST /enterprise/import`

Import data from other platforms.

**Request Body (multipart/form-data):**
- `file`: Data file (JSON, CSV, XLSX)
- `source_platform`: coloop, nvivo, maxqda
- `mapping`: Field mapping configuration

**Response (202):**
```json
{
  "job_id": "uuid",
  "status": "processing",
  "validation_results": {
    "total_records": 1000,
    "valid": 950,
    "warnings": 30,
    "errors": 20
  }
}
```

### Get Audit Logs
`GET /enterprise/audit-logs`

Get audit logs (admin only).

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `user_id` (uuid): Filter by user
- `action` (string): Filter by action type
- `date_from` (date): Start date
- `date_to` (date): End date

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "timestamp": "2024-01-20T10:00:00Z",
      "user": {
        "id": "uuid",
        "email": "user@example.com"
      },
      "action": "project.create",
      "resource_type": "project",
      "resource_id": "uuid",
      "details": {
        "project_name": "New Project"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    }
  ],
  "total": 500,
  "page": 1,
  "pages": 25
}
```

---

## WebSocket Endpoints

### Connect to Project
`WS /ws/projects/{project_id}`

Connect to real-time project updates.

**Connection URL:**
```
wss://api.qualengine.com/ws/projects/{project_id}?token={jwt_token}
```

**Message Types:**

#### Join Project
```json
{
  "type": "join",
  "data": {
    "user_id": "uuid",
    "user_name": "John Doe"
  }
}
```

#### Update Cursor
```json
{
  "type": "cursor",
  "data": {
    "position": {"row": 5, "col": 3},
    "selection": null
  }
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "data": {
    "is_typing": true,
    "location": "grid_cell_uuid"
  }
}
```

#### Cell Update
```json
{
  "type": "cell_update",
  "data": {
    "grid_id": "uuid",
    "cell_id": "uuid",
    "value": "Updated content"
  }
}
```

**Server Events:**

#### User Joined
```json
{
  "type": "user_joined",
  "data": {
    "user_id": "uuid",
    "user_name": "Jane Doe",
    "timestamp": "2024-01-20T10:00:00Z"
  }
}
```

#### Presence Update
```json
{
  "type": "presence_update",
  "data": {
    "users": [
      {
        "user_id": "uuid",
        "user_name": "John Doe",
        "status": "active",
        "cursor": {"row": 5, "col": 3}
      }
    ]
  }
}
```

#### Data Change
```json
{
  "type": "data_change",
  "data": {
    "change_type": "cell_update",
    "resource": "grid",
    "resource_id": "uuid",
    "changes": {
      "cell_id": "uuid",
      "new_value": "Updated"
    },
    "user": "John Doe",
    "timestamp": "2024-01-20T10:00:00Z"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "details": {
    "field": "email",
    "error": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Validation Error",
  "message": "Input validation failed",
  "details": [
    {
      "loc": ["body", "password"],
      "msg": "Password must be at least 8 characters",
      "type": "value_error"
    }
  ]
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "request_id": "uuid"
}
```

---

## Rate Limiting

API endpoints have the following rate limits:

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| Export/Import | 10 requests | 1 hour |
| AI Generation | 20 requests | 1 minute |

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

---

## Pagination

List endpoints support pagination with the following parameters:

- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)

Paginated responses include:
```json
{
  "items": [...],
  "total": 250,
  "page": 1,
  "pages": 13,
  "has_next": true,
  "has_prev": false
}
```

---

## Filtering and Sorting

Most list endpoints support filtering and sorting:

**Query Parameters:**
- `sort_by`: Field to sort by
- `sort_order`: asc or desc
- `search`: Search term
- `filters`: JSON encoded filter object

Example:
```
GET /projects?sort_by=created_at&sort_order=desc&search=customer&filters={"status":"active"}
```

---

## Webhooks

Configure webhooks to receive real-time notifications:

### Webhook Events
- `project.created`
- `project.updated`
- `project.deleted`
- `analysis.completed`
- `transcript.processed`
- `export.completed`
- `import.completed`

### Webhook Payload
```json
{
  "event": "analysis.completed",
  "timestamp": "2024-01-20T10:00:00Z",
  "data": {
    "analysis_id": "uuid",
    "project_id": "uuid",
    "status": "completed"
  }
}
```

---

## SDK Examples

### Python
```python
import requests

class QualEngineClient:
    def __init__(self, api_key):
        self.base_url = "https://api.qualengine.com/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def create_project(self, name, description):
        response = requests.post(
            f"{self.base_url}/projects",
            json={"name": name, "description": description},
            headers=self.headers
        )
        return response.json()
```

### JavaScript/TypeScript
```typescript
class QualEngineClient {
  private baseUrl = 'https://api.qualengine.com/api/v1';

  constructor(private apiKey: string) {}

  async createProject(name: string, description: string) {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description })
    });
    return response.json();
  }
}
```

---

## Support

- **API Status**: https://status.qualengine.com
- **Developer Portal**: https://developers.qualengine.com
- **Support Email**: api-support@qualengine.com
- **GitHub Issues**: https://github.com/qualengine/api-issues

---

Last Updated: December 24, 2024
API Version: v1.0.0