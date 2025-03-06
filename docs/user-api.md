# User API Documentation

This document describes the user-related endpoints for the Horizon 777 betting platform.

## Base URL

```
/api/users
```

## Authentication

All endpoints in this API require JWT authentication. Include the JWT token in the Authorization header as follows:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Get User Profile

```http
GET /api/users/profile
```

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Response

**Success (200 OK)**
```json
{
    "_id": "user_id",
    "username": "string",
    "balance": 0,
    "settings": {
        "language": "pt-br",
        "notifications": true,
        "theme": "dark"
    },
    "lastLogin": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses**
- `401 Unauthorized`: No token provided or invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Update User Settings

```http
PUT /api/users/settings
```

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Request Body

```json
{
    "language": "string",     // Optional: "pt-br", "en", or "es"
    "notifications": boolean,  // Optional
    "theme": "string"        // Optional: "dark" or "light"
}
```

Note: All fields in the request body are optional. Only provided fields will be updated.

#### Response

**Success (200 OK)**
```json
{
    "message": "Settings updated successfully",
    "settings": {
        "language": "string",
        "notifications": boolean,
        "theme": "string"
    }
}
```

**Error Responses**
- `401 Unauthorized`: No token provided or invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

## Settings Options

### Language Options
- `pt-br`: Portuguese (Brazil)
- `en`: English
- `es`: Spanish
- `ar`: Arabic (العربية)

### Theme Options
- `dark`: Dark theme
- `light`: Light theme

### Notifications
- `true`: Enabled
- `false`: Disabled