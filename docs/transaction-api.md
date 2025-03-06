# Transaction API Documentation

This document describes the transaction-related endpoints for the Horizon 777 betting platform.

## Base URL

```
/api/transactions
```

## Authentication

All endpoints in this API require JWT authentication. Include the JWT token in the Authorization header as follows:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Get Transaction History

```http
GET /api/transactions/history
```

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Response

**Success (200 OK)**
```json
[
    {
        "_id": "transaction_id",
        "userId": "user_id",
        "type": "string",
        "amount": 0,
        "status": "string",
        "paymentMethod": "string",
        "externalReference": "string",
        "metadata": {},
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
    }
]
```

**Error Responses**
- `401 Unauthorized`: No token provided or invalid token
- `500 Internal Server Error`: Server error

### Initiate Deposit

```http
POST /api/transactions/deposit/initiate
```

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Request Body

```json
{
    "amount": "number",
    "paymentMethod": "string"
}
```

#### Response

**Success (200 OK)**
```json
{
    "message": "Deposit initiated",
    "transaction": "transaction_id",
    "paymentUrl": "string"
}
```

**Error Responses**
- `400 Bad Request`: Invalid amount
- `401 Unauthorized`: No token provided or invalid token
- `500 Internal Server Error`: Server error

### Payment Provider Callback

```http
POST /api/transactions/deposit/callback
```

#### Request Body

```json
{
    "transactionId": "string",
    "status": "string",
    "externalReference": "string"
}
```

#### Response

**Success (200 OK)**
```json
{
    "message": "Payment status updated"
}
```

**Error Responses**
- `404 Not Found`: Transaction not found
- `500 Internal Server Error`: Server error

### Request Withdrawal

```http
POST /api/transactions/withdrawal/request
```

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Request Body

```json
{
    "amount": "number",
    "paymentMethod": "string"
}
```

#### Response

**Success (200 OK)**
```json
{
    "message": "Withdrawal request submitted",
    "transaction": "transaction_id"
}
```

**Error Responses**
- `400 Bad Request`: Invalid amount
- `401 Unauthorized`: No token provided or invalid token
- `500 Internal Server Error`: Server error

## Transaction Types
- `DEPOSIT`: Money added to account
- `WITHDRAWAL`: Money withdrawn from account
- `BET`: Money used for placing bets
- `WIN`: Money won from bets

## Transaction Status
- `PENDING`: Transaction is being processed
- `COMPLETED`: Transaction has been completed successfully
- `FAILED`: Transaction has failed
- `CANCELLED`: Transaction was cancelled