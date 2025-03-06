# Authentication API Documentation

This document describes the authentication endpoints for the Horizon 777 betting platform.

## Base URL

```
/api/auth
```

## Endpoints

### Register New User

```http
POST /api/auth/register
```

#### Request Body

```json
{
    "username": "string",
    "password": "string"
}
```

#### Requirements
- Username must be at least 3 characters long
- Password must be at least 6 characters long

#### Response

**Success (201 Created)**
```json
{
    "message": "User registered successfully",
    "token": "jwt_token_string",
    "user": {
        "id": "user_id",
        "username": "string",
        "balance": 0,
        "settings": {
            "language": "pt-br",
            "notifications": true,
            "theme": "dark"
        }
    }
}
```

**Error Responses**
- `400 Bad Request`: Username already exists
- `500 Internal Server Error`: Server error

### Login

```http
POST /api/auth/login
```

#### Request Body

```json
{
    "username": "string",
    "password": "string"
}
```

#### Response

**Success (200 OK)**
```json
{
    "message": "Login successful",
    "token": "jwt_token_string",
    "user": {
        "id": "user_id",
        "username": "string",
        "balance": 0,
        "settings": {
            "language": "pt-br",
            "notifications": true,
            "theme": "dark"
        }
    }
}
```

**Error Responses**
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

### Get Current User Info

```http
GET /api/auth/me
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

### Logout

```http
POST /api/auth/logout
```

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Response

**Success (200 OK)**
```json
{
    "message": "Logged out successfully"
}
```

**Error Responses**
- `401 Unauthorized`: No token provided or invalid token

## Authentication

All endpoints except `/register` and `/login` require JWT authentication. Include the JWT token in the Authorization header as follows:

```
Authorization: Bearer <jwt_token>
```

The JWT token is valid for 24 hours after issuance.