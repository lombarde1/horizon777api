# PIX Payment API Documentation

This document describes the PIX payment integration endpoints.

## Endpoints

### Generate PIX QR Code
`POST /api/pix/generate`

Generates a PIX QR code for payment.

#### Authentication
Requires a valid JWT token in the Authorization header.

#### Request Body
```json
{
    "amount": 100.00
}
```

#### Response

**Success (200 OK)**
```json
{
    "message": "PIX QR Code generated successfully",
    "transaction_id": "transaction_id",
    "external_id": "unique_external_id",
    "qr_code": "PIX_QR_CODE_DATA",
    "amount": 100.00
}
```

**Error Responses**
- `400 Bad Request`: Invalid amount
- `401 Unauthorized`: No token provided or invalid token
- `500 Internal Server Error`: Server error


### Check PIX Payment Status
`GET /api/pix/status/:external_id`

Retrieve the current status of a PIX payment transaction.

#### Authentication
Requires a valid JWT token in the Authorization header.

#### URL Parameters
- `external_id`: The unique external ID of the transaction

#### Response

**Success (200 OK)**
```json
{
    "status": "PENDING|COMPLETED",
    "transaction_id": "transaction_id",
    "external_id": "unique_external_id",
    "amount": 100.00,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "metadata": {
        "pixupTransactionId": "pixup_transaction_id",
        "dateApproval": "2024-01-01T12:00:00Z",
        "payerInfo": {
            "name": "Payer Name",
            "pixKey": "payer_pix_key"
        }
    }
}
```

**Error Responses**
- `403 Forbidden`: Unauthorized to view this transaction
- `404 Not Found`: Transaction not found
- `500 Internal Server Error`: Error checking payment status

## Implementation Notes

1. The PIX QR code generation uses the PixUp API service.
2. Webhook URL must be configured in your environment variables.
3. All amounts are in Brazilian Real (BRL).
4. External IDs are generated using cryptographic random bytes for security.
5. Transaction status is automatically updated upon successful payment confirmation.
6. User balance is automatically updated when payment is confirmed.