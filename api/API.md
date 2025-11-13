# Invoice Management API Documentation

## Base URL
```
http://localhost:4000
```

## Default Admin Credentials

A default admin user is automatically created when you run the database migrations:

- **Email**: `admin@varcade.com`
- **Password**: `admin@123`

The admin user is created by the initial migration (`0000000000001-InitialSchema.ts`) when you run:
```bash
cd api
npm run typeorm:run
```

> ⚠️ **Security Note**: Change the admin password immediately in production environments.

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register a new user
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt-token"
}
```

**Validation:**
- `name`: Required, non-empty string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already in use
- `500 Internal Server Error`: Server error

---

#### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt-token"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required, non-empty string

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

---

### Invoices

All invoice endpoints require authentication.

#### Create an invoice
```
POST /invoices
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "invoiceNumber": "INV-001",
  "customerId": "uuid-optional",
  "customerName": "Acme Corp",
  "lineItems": [
    {
      "description": "Web Development",
      "quantity": 10,
      "unitPrice": 100.50
    }
  ],
  "sgstPercent": 9,
  "cgstPercent": 9,
  "igstPercent": 0
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-001",
  "customerId": "uuid",
  "customerName": "Acme Corp",
  "lineItems": [...],
  "subtotal": 1005.00,
  "sgstAmount": 90.45,
  "cgstAmount": 90.45,
  "igstAmount": 0,
  "totalTaxAmount": 180.90,
  "sgstPercent": 9,
  "cgstPercent": 9,
  "igstPercent": 0,
  "totalAmount": 1185.90,
  "status": "draft",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Validation:**
- `customerName`: Required, non-empty string
- `lineItems`: Optional array with at least 1 item
- Each line item must have: `description` (string), `quantity` (number), `unitPrice` (number)
- Tax percentages are optional numbers

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

#### List invoices
```
GET /invoices?page=1&limit=20&status=draft&customerId=uuid
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (optional): `draft`, `sent`, `invoice amount paid`, `closed`, `cancelled`
- `customerId`: Filter by customer ID (optional)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-001",
      "customerName": "Acme Corp",
      "subtotal": 1005.00,
      "totalAmount": 1185.90,
      "status": "draft",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Authorization:**
- Regular users see only their own invoices
- Admins see all invoices

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

#### Get invoice by ID
```
GET /invoices/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-001",
  "customerId": "uuid",
  "customerName": "Acme Corp",
  "lineItems": [...],
  "subtotal": 1005.00,
  "sgstAmount": 90.45,
  "cgstAmount": 90.45,
  "igstAmount": 0,
  "totalTaxAmount": 180.90,
  "totalAmount": 1185.90,
  "status": "draft",
  "customer": {...},
  "createdBy": {...},
  "updatedBy": {...},
  "invoiceBelongsTo": {...},
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Authorization:**
- Must be invoice owner or admin

**Error Responses:**
- `400 Bad Request`: Missing ID
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Not invoice owner
- `404 Not Found`: Invoice not found
- `500 Internal Server Error`: Server error

---

#### Update an invoice
```
PUT /invoices/:id
Authorization: Bearer <token>
```

**Request Body:** Same as create invoice

**Response:** `200 OK` - Returns updated invoice

**Authorization:**
- Must be invoice owner or admin

**Error Responses:**
- `400 Bad Request`: Validation errors or missing ID
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Not invoice owner
- `404 Not Found`: Invoice not found
- `500 Internal Server Error`: Server error

---

#### Delete an invoice
```
DELETE /invoices/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Authorization:**
- Admin only

**Error Responses:**
- `400 Bad Request`: Missing ID
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Not an admin
- `404 Not Found`: Invoice not found
- `500 Internal Server Error`: Server error

---

### Health Check

#### Check API health
```
GET /health
```

**Response:** `200 OK`
```json
{
  "ok": true
}
```

## Error Response Format

All error responses follow this format:
```json
{
  "message": "Error description"
}
```

Or for validation errors:
```json
{
  "errors": [
    {
      "property": "email",
      "constraints": {
        "isEmail": "email must be an email"
      }
    }
  ]
}
```

## Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `204 No Content`: Success with no response body
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server error

---

### User Management

All user management endpoints require authentication. Most operations require admin role.

#### Get all users
```
GET /users
```

**Authorization:** Admin only

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "address": "123 Main St",
    "gstRegistered": false,
    "gstNumber": null,
    "panNumber": null,
    "serviceProviderState": null,
    "serviceProviderStateCode": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get a single user
```
GET /users/:id
```

**Authorization:** Admin or self

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "address": "123 Main St",
  "gstRegistered": false,
  "gstNumber": null,
  "panNumber": null,
  "serviceProviderState": null,
  "serviceProviderStateCode": null,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Create a new user
```
POST /users
```

**Authorization:** Admin only

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "user",
  "address": "456 Oak Ave",
  "gstRegistered": true,
  "gstNumber": "22AAAAA0000A1Z5",
  "panNumber": "ABCDE1234F",
  "serviceProviderState": "Maharashtra",
  "serviceProviderStateCode": "27"
}
```

**Note:** Only `name`, `email`, and `password` are required. All other fields are optional.

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "user",
  "address": "456 Oak Ave",
  "gstRegistered": true,
  "gstNumber": "22AAAAA0000A1Z5",
  "panNumber": "ABCDE1234F",
  "serviceProviderState": "Maharashtra",
  "serviceProviderStateCode": "27",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update a user
```
PUT /users/:id
```

**Authorization:** Admin or self (users can only update their own profile, admins can update any user)

**Request Body:** (all fields optional)
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.new@example.com",
  "password": "newpassword123",
  "role": "admin",
  "address": "789 Pine Rd",
  "gstRegistered": true,
  "gstNumber": "22AAAAA0000A1Z6",
  "panNumber": "ABCDE1234G",
  "serviceProviderState": "Gujarat",
  "serviceProviderStateCode": "24"
}
```

**Note:** Only admins can update the `role` field.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Jane Smith Updated",
  "email": "jane.new@example.com",
  "role": "admin",
  "address": "789 Pine Rd",
  "gstRegistered": true,
  "gstNumber": "22AAAAA0000A1Z6",
  "panNumber": "ABCDE1234G",
  "serviceProviderState": "Gujarat",
  "serviceProviderStateCode": "24",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Deactivate a user (Soft Delete)
```
DELETE /users/:id
```

**Authorization:** Admin only

**Note:** This is a soft delete operation. The user record is not removed from the database but marked as inactive. Deactivated users cannot log in.

**Restrictions:**
- Cannot deactivate the system user (ID: 00000000-0000-0000-0000-000000000000)
- Cannot deactivate yourself

**Response:** `200 OK`
```json
{
  "message": "User deactivated successfully",
  "userId": "uuid"
}
```

#### Reactivate a deactivated user
```
POST /users/:id/reactivate
```

**Authorization:** Admin only

**Response:** `200 OK`
```json
{
  "message": "User reactivated successfully",
  "userId": "uuid"
}
```

### User Management Error Responses

**400 Bad Request**
- Missing required fields
- Invalid data format
- Email already exists
- Password too short
- Cannot deactivate system user
- Cannot deactivate yourself
- User already active/deactivated

**401 Unauthorized**
- No authentication token provided
- Invalid or expired token
- Account has been deactivated (login attempt)

**403 Forbidden**
- Not authorized to perform this action (non-admin trying admin action)

**404 Not Found**
- User not found

**500 Internal Server Error**
- Database error
- Unexpected server error

