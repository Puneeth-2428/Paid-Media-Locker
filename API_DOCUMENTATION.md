# API Documentation

Base URL: `http://localhost:4000/api`

## Authentication (`/api/auth`)

### 1. Register User
- **URL:** `/auth/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "_id": "60d5ecb8b392...",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
  ```

### 2. Login User
- **URL:** `/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "_id": "60d5ecb8b392...",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
  ```

## Media (`/api/media`)
*Note: All media routes require a valid JWT in the `Authorization: Bearer <token>` header.*

### 1. Upload Media
- **URL:** `/media/upload`
- **Method:** `POST`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:**
  - `image`: The image file (binary)
  - `price`: Integer (e.g., `50`)
- **Response (201 Created):**
  ```json
  {
    "_id": "60d5f0b8b392...",
    "owner": "60d5ecb8b392...",
    "price": 50,
    "originalKey": "originals/uuid-image.jpg",
    "previewKey": "previews/uuid-preview.jpg",
    "createdAt": "2023-10-25T10:00:00.000Z"
  }
  ```

### 2. Get Feed
- **URL:** `/media`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  [
    {
      "_id": "60d5f0b8b392...",
      "owner": "John Doe",
      "price": 50,
      "previewUrl": "http://10.x.x.x:4568/paid-media-bucket/previews/...",
      "status": "locked", // or "unlocked"
      "createdAt": "2023-10-25T10:00:00.000Z"
    }
  ]
  ```

### 3. Unlock Media
- **URL:** `/media/:id/unlock`
- **Method:** `POST`
- **Response (200 OK):**
  ```json
  {
    "message": "Unlocked successfully",
    "balance": 50 // Remaining wallet balance
  }
  ```
- **Error (400 Bad Request):** If insufficient funds or already unlocked.

### 4. Get Access URL (View Original)
- **URL:** `/media/:id/access`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  {
    "originalUrl": "http://10.x.x.x:4568/paid-media-bucket/originals/...?X-Amz-Signature=..."
  }
  ```
- **Error (403 Forbidden):** If the user has not unlocked the media and is not the owner.

## Wallet (`/api/wallet`)
*Note: Requires valid JWT.*

### 1. Get Wallet Balance and History
- **URL:** `/wallet`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  {
    "balance": 50,
    "history": [
      {
        "_id": "60d5f1b8b392...",
        "type": "purchase",
        "amount": 50,
        "media": "60d5f0b8b392...",
        "createdAt": "2023-10-25T10:05:00.000Z"
      }
    ]
  }
  ```
