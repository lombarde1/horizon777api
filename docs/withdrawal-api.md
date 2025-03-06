# Withdrawal API Documentation

## Endpoints

### Request Withdrawal

```http
POST /api/withdrawal/request
```

**Authentication required**: Yes (JWT Token)

#### Request Body

```json
{
    "amount": 100.00,
    "pixKeyType": "CPF",
    "pixKey": "12345678900"
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `amount` | `number` | The amount to withdraw (must be greater than 0) |
| `pixKeyType` | `string` | Type of PIX key. Valid values: `CPF`, `EMAIL`, `PHONE`, `RANDOM` |
| `pixKey` | `string` | The PIX key value corresponding to the specified type |

#### Success Response

**Code**: 201 CREATED

```json
{
    "message": "Withdrawal request created successfully",
    "transaction_id": "507f1f77bcf86cd799439011",
    "amount": 100.00,
    "status": "PENDING",
    "remaining_balance": 900.00,
    "pix_info": {
        "key_type": "CPF",
        "key": "12345678900"
    }
}
```

#### Error Responses

**Condition**: Invalid withdrawal amount

**Code**: 400 BAD REQUEST
```json
{
    "message": "Invalid withdrawal amount"
}
```

**Condition**: Missing PIX key information

**Code**: 400 BAD REQUEST
```json
{
    "message": "PIX key information is required"
}
```

**Condition**: Invalid PIX key type

**Code**: 400 BAD REQUEST
```json
{
    "message": "Invalid PIX key type"
}
```

**Condition**: Insufficient balance

**Code**: 400 BAD REQUEST
```json
{
    "message": "Insufficient balance"
}
```

**Condition**: User not found

**Code**: 404 NOT FOUND
```json
{
    "message": "User not found"
}
```

**Condition**: Server error

**Code**: 500 INTERNAL SERVER ERROR
```json
{
    "message": "Error processing withdrawal request"
}
```

### Notes

- The withdrawal request will automatically update the user's balance by deducting the requested amount
- The withdrawal status will be set to "PENDING" initially
- All amounts are processed in the account's currency
- PIX key types must be one of: CPF, EMAIL, PHONE, or RANDOM
- Authentication via JWT token is required in the Authorization header