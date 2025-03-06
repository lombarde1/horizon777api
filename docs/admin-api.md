# Admin API Documentation

This document outlines the administrative API endpoints for the platform. All endpoints require authentication and admin privileges.

## Authentication

All endpoints require:
1. A valid JWT token in the Authorization header
2. Admin role privileges

```
Authorization: Bearer <jwt_token>
```

## Withdrawal Management

### Approve Withdrawal

```http
PATCH /admin/withdrawals/:transactionId/approve
```

Approves a pending withdrawal request.

#### Response

```json
{
    "message": "Withdrawal approved successfully",
    "transaction": {
        "id": "transaction_id",
        "status": "COMPLETED",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

### Reject Withdrawal

```http
PATCH /admin/withdrawals/:transactionId/reject
```

Rejects a pending withdrawal request and refunds the amount to user's balance.

#### Response

```json
{
    "message": "Withdrawal rejected successfully",
    "transaction": {
        "id": "transaction_id",
        "status": "CANCELLED",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

### List Withdrawals

```http
GET /admin/withdrawals
```

Retrieve a paginated list of withdrawal requests.

#### Query Parameters

| Parameter | Type    | Description                                                  |
|-----------|---------|--------------------------------------------------------------|
| page      | integer | Page number (default: 1)                                     |
| limit     | integer | Number of items per page (default: 10)                       |
| status    | string  | Filter by status (PENDING, COMPLETED, CANCELLED, ALL)        |

#### Response

```json
{
    "withdrawals": [
        {
            "id": "transaction_id",
            "amount": 100.00,
            "status": "PENDING",
            "username": "user123",
            "created_at": "2024-01-01T00:00:00.000Z",
            "pix_info": {
                "key_type": "CPF",
                "key": "12345678900"
            }
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_withdrawals": 50
    }
}
```
    "transaction": {
        "id": "transaction_id",
        "status": "CANCELLED",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

## User Balance Management

### Update User Balance

```http
PATCH /admin/users/:userId/balance
```

Modify a user's balance by adding or subtracting an amount.

#### Request Body

```json
{
    "amount": 100.00,
    "type": "ADD",  // or "SUBTRACT"
    "reason": "Bonus credit"
}
```

#### Response

```json
{
    "message": "Balance updated successfully",
    "user": {
        "id": "user_id",
        "balance": 1000.00,
        "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "transaction": {
        "id": "transaction_id",
        "type": "ADD",
        "amount": 100.00,
        "status": "COMPLETED"
    }
}
```

## Platform Analytics

### Overview

```http
GET /admin/analytics/overview
```

Get platform-wide analytics for the last 24 hours.

#### Response

```json
{
    "total_users": 1000,
    "active_users_24h": 150,
    "total_bets_24h": 500,
    "total_withdrawals_24h": 5000.00,
    "total_deposits_24h": 10000.00,
    "active_games": 5,
    "platform_balance": 50000.00
}
```

### Detailed Statistics

```http
GET /admin/analytics/statistics
```

#### Query Parameters

- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `type`: Statistics type

#### Response

```json
{
    "period": {
        "start": "2024-01-01T00:00:00.000Z",
        "end": "2024-01-31T23:59:59.999Z"
    },
    "data": {
        "daily_stats": [
            {
                "_id": "2024-01-01",
                "new_users": 10,
                "revenue": 1000.00
            }
        ],
        "total_stats": {
            "new_users": 100,
            "revenue": 10000.00,
            "profit": 1000.00
        }
    }
}
```

## User Management

### List Users

```http
GET /admin/users
```

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by user status
- `search`: Search by username or email

#### Response

```json
{
    "users": [
        {
            "_id": "user_id",
            "username": "user123",
            "balance": 1000.00,
            "status": "active"
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 10,
        "total_users": 100
    }
}
```

### Update User Status

```http
PATCH /admin/users/:userId/status
```

#### Request Body

```json
{
    "status": "suspended",
    "reason": "Violation of terms"
}
```

#### Response

```json
{
    "message": "User status updated successfully",
    "user": {
        "_id": "user_id",
        "username": "user123",
        "status": "suspended",
        "status_reason": "Violation of terms"
    }
}
```

## Transaction Management

### List Transactions

```http
GET /admin/transactions
```

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Filter by transaction type
- `status`: Filter by transaction status
- `start_date`: Start date filter
- `end_date`: End date filter

#### Response

```json
{
    "transactions": [
        {
            "_id": "transaction_id",
            "type": "DEPOSIT",
            "amount": 100.00,
            "status": "COMPLETED",
            "username": "user123"
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_transactions": 50
    }
}
```

### Update Transaction Status

```http
PATCH /admin/transactions/:transactionId/status
```

#### Request Body

```json
{
    "status": "COMPLETED",
    "notes": "Manual approval"
}
```

#### Response

```json
{
    "message": "Transaction status updated successfully",
    "transaction": {
        "_id": "transaction_id",
        "status": "COMPLETED",
        "admin_notes": "Manual approval"
    }
}
```

## Game Management

### List Games

```http
GET /admin/games
```

#### Response

```json
{
    "games": [
        {
            "_id": "game_id",
            "name": "Game Name",
            "status": "active",
            "total_bets": 1000,
            "total_wagered": 10000.00,
            "total_payout": 9000.00,
            "profit_margin": 10.00,
            "active_players": 50
        }
    ]
}
```

### Update Game Settings

```http
PATCH /admin/games/:gameId/settings
```

#### Request Body

```json
{
    "status": "active",
    "min_bet": 1.00,
    "max_bet": 1000.00,
    "house_edge": 2.5
}
```

#### Response

```json
{
    "message": "Game settings updated successfully",
    "game": {
        "_id": "game_id",
        "status": "active",
        "min_bet": 1.00,
        "max_bet": 1000.00,
        "house_edge": 2.5
    }
}
```