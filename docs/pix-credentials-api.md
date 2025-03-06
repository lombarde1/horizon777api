# PIX Credentials Management API

API endpoints for managing PIX integration credentials. These endpoints are restricted to admin users only.

## Get Current PIX Credentials

Retrieve the currently active PIX integration credentials.

```http
GET /api/admin/pix-credentials/current
```

### Headers

- `Authorization`: Bearer token (required)

### Response

```json
{
    "_id": "string",
    "baseUrl": "string",
    "webhookUrl": "string",
    "isActive": true,
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

### Error Responses

- `401`: Unauthorized - Invalid or missing token
- `404`: No active PIX credentials found
- `500`: Server error

## Update PIX Credentials

Update the PIX integration credentials. This will deactivate any currently active credentials and create new ones.

```http
PUT /api/admin/pix-credentials/update
```

### Headers

- `Authorization`: Bearer token (required)

### Request Body

```json
{
    "clientId": "string (required)",
    "clientSecret": "string (required)",
    "baseUrl": "string (optional)",
    "webhookUrl": "string (required)"
}
```

### Response

```json
{
    "message": "PIX credentials updated successfully",
    "credentials": {
        "_id": "string",
        "baseUrl": "string",
        "webhookUrl": "string",
        "isActive": true,
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
    }
}
```

### Error Responses

- `400`: Missing required fields
- `401`: Unauthorized - Invalid or missing token
- `500`: Server error

## Security

All endpoints require:
1. Valid JWT token
2. Admin role permissions

Sensitive data (clientId and clientSecret) are never returned in responses.