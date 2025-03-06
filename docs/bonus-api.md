# Bonus API Documentation

## Endpoints

### Claim Bonus

```http
POST /api/bonus/claim
```

Claims the bonus for the authenticated user, doubling their current balance. This bonus can only be claimed once per user and requires an existing balance greater than 0.

#### Authentication

- Bearer Token required

#### Request

- No request body required

#### Response

##### Success Response (200 OK)

```json
{
    "message": "Bonus claimed successfully",
    "previousBalance": 100.00,
    "currentBalance": 200.00
}
```

##### Error Responses

###### 400 Bad Request

```json
{
    "message": "Bonus already claimed"
}
```

```json
{
    "message": "No balance available to apply bonus"
}
```

###### 401 Unauthorized

```json
{
    "message": "No token provided"
}
```

```json
{
    "message": "Invalid token"
}
```

###### 404 Not Found

```json
{
    "message": "User not found"
}
```

###### 500 Internal Server Error

```json
{
    "message": "Error processing bonus claim"
}
```


#### Notes

- The bonus can only be claimed once per user account
- User must have a balance greater than 0 to claim the bonus
- The bonus will double the user's current balance
- A transaction record of type 'BONUS' will be created when the bonus is claimed
- The bonus claim operation is atomic and will either complete fully or not at all