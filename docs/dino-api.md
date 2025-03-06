# Dino Rex Game API Documentation

This document outlines the API endpoints for the Dino Rex game functionality.

## Authentication

All endpoints require a valid JWT token in the Authorization header:
`Authorization: Bearer <token>`

## Endpoints

### Start New Game

```http
POST /api/dino/start
```

Starts a new Dino Rex game session.

#### Response

```json
{
    "_id": "game_id",
    "userId": "user_id",
    "status": "active",
    "score": 0,
    "speed": 1,
    "earnedAmount": 0,
    "startTime": "2024-01-01T00:00:00.000Z",
    "lastUpdateTime": "2024-01-01T00:00:00.000Z"
}
```

### Jump Action

```http
POST /api/dino/:gameId/jump
```

Registers a jump action and updates the game state.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| gameId | string | ID of the active game session |

#### Response

```json
{
    "_id": "game_id",
    "score": 10,
    "speed": 1.5,
    "earnedAmount": 15,
    "lastUpdateTime": "2024-01-01T00:00:10.000Z"
}
```

### End Game

```http
POST /api/dino/:gameId/end
```

Ends the game session (called on collision).

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| gameId | string | ID of the active game session |

#### Response

```json
{
    "_id": "game_id",
    "status": "ended",
    "score": 15,
    "earnedAmount": 20,
    "endTime": "2024-01-01T00:00:15.000Z"
}
```

### Get Game History

```http
GET /api/dino/history
```

Retrieves the user's game history.

#### Response

```json
[
    {
        "_id": "game_id",
        "status": "ended",
        "score": 15,
        "earnedAmount": 20,
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-01-01T00:00:15.000Z"
    }
]
```

### Get Active Game

```http
GET /api/dino/active
```

Retrieves the current active game session if one exists.

#### Response

```json
{
    "_id": "game_id",
    "status": "active",
    "score": 8,
    "speed": 1.3,
    "earnedAmount": 10,
    "startTime": "2024-01-01T00:00:00.000Z",
    "lastUpdateTime": "2024-01-01T00:00:08.000Z"
}
```

## Error Responses

```json
{
    "message": "Error message description"
}
```

Common error messages:
- "You already have an active game"
- "Insufficient balance to start a game"
- "Active game not found"
- "No active game found"