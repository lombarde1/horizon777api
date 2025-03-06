# Game API Documentation

This document describes the game-related endpoints for the Horizon 777 betting platform.

## Base URL

```
/api/games
```

## Endpoints

### List All Games

```http
GET /api/games
```

#### Response

**Success (200 OK)**
```json
[
    {
        "_id": "game_id",
        "name": "string",
        "category": "string",
        "isActive": true,
        "description": "string",
        "thumbnailUrl": "string",
        "minBet": 0,
        "maxBet": 0
    }
]
```

**Error Responses**
- `500 Internal Server Error`: Server error

### List Featured Games

```http
GET /api/games/featured
```

#### Response

**Success (200 OK)**
```json
[
    {
        "_id": "game_id",
        "name": "string",
        "category": "string",
        "isActive": true,
        "description": "string",
        "thumbnailUrl": "string",
        "minBet": 0,
        "maxBet": 0
    }
]
```

**Error Responses**
- `500 Internal Server Error`: Server error

### List Game Categories

```http
GET /api/games/categories
```

#### Response

**Success (200 OK)**
```json
[
    "string"
]
```

**Error Responses**
- `500 Internal Server Error`: Server error

### Get Game Details

```http
GET /api/games/:id
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| id   | string | Game ID |

#### Response

**Success (200 OK)**
```json
{
    "_id": "game_id",
    "name": "string",
    "category": "string",
    "isActive": true,
    "description": "string",
    "thumbnailUrl": "string",
    "minBet": 0,
    "maxBet": 0,
    "rules": "string",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses**
- `404 Not Found`: Game not found
- `500 Internal Server Error`: Server error

## Notes

- All game endpoints are public and do not require authentication
- Only active games are returned in the responses
- Featured games are limited to 6 games
- Game categories are automatically generated from existing games