# Paid Media Locker

A full-stack application that allows users to upload images and monetize them by setting an unlock price. Other users can view a watermarked preview of the image until they spend coins from their wallet to unlock the original content.

## Architecture Overview

**Demo Login Credentials (for evaluator testing):**
- **Email:** demo@konvo.com
- **Password:** password123

The system consists of three main components:
1. **Backend API:** A Node.js/Express REST API.
2. **Database & Storage:** MongoDB for data persistence and a local `s3rver` instance (Amazon S3 clone) for secure media storage.
3. **Mobile App:** A React Native Android application built with Expo for the frontend client.

Both the Backend API and the Database/Storage components are fully containerized using Docker for seamless local deployment.

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Emulator or a physical device with the Expo Go app.

### 1. Start the Backend Infrastructure
The backend is fully dockerized. To start the API, MongoDB, and S3 server:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   **Note on S3_PUBLIC_HOST**: The `.env` file contains `S3_PUBLIC_HOST` which defaults to `http://localhost:4568`. This is used to serve S3 media URLs. If you are testing on a physical mobile device or Android emulator, set this to your local machine's IP (e.g., `http://192.168.1.5:4568`) or `http://10.0.2.2:4568` for Android emulators.

4. **Start the Backend Services:**
   Run the full backend stack (API, S3rver, MongoDB) using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

5. **Seed the Database (Demo Content):**
   Once the database is up, you can seed it with the evaluator demo credentials (`demo@konvo.com` / `password123`) and initial media:
   ```bash
   npm run seed
   ```
The backend API will be available at `http://localhost:4000`.

### 2. Configure the Mobile App Network
If you are using a physical device, you must configure the mobile app to talk to your computer's local IP address rather than `localhost`.
1. Find your computer's local Wi-Fi IP address (e.g., `10.x.x.x` or `192.168.x.x`).
2. Open `mobile-app/src/api/client.js`.
3. Replace the `baseURL` IP address with your computer's IP address.
4. Also ensure `backend/src/config/s3.js` and `backend/src/controllers/media.controller.js` use your computer's IP address for external S3 links.

### 3. Start the Mobile App
```bash
# Navigate to the mobile app directory
cd mobile-app

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```
Scan the QR code with your Expo Go app on Android to launch the application.

## Security Decisions

Security was a primary focus when architecting this application. The following decisions were made to protect paid content and user data:

### 1. Access Control
All sensitive routes (uploading, unlocking, viewing wallet, viewing feed) are protected by a JWT (JSON Web Token) authentication middleware. The JWT is issued upon login/registration and must be provided in the `Authorization: Bearer <token>` header. Passwords are cryptographically hashed using `bcryptjs` before being saved to the database.

### 2. Media Storage Strategy
Media is NOT stored publicly on the local filesystem. Instead, we utilize an S3-compatible object storage service (`s3rver`). The storage is split logically into two locations:
- `previews/`: Contains heavily blurred, watermarked, downscaled (800x600) JPEG representations of the images.
- `originals/`: Contains the unaltered, high-resolution original uploads.

### 3. Preventing Direct Access to Original Files
The `originals/` objects in S3 are entirely private. The S3 server does not allow public reads for these objects. 
To deliver the original image, we generate **Pre-signed URLs** using the AWS SDK. These URLs contain cryptographic signatures (`AWS4-HMAC-SHA256`) that temporarily grant access to the specific object.

### 4. Secure Delivery of Unlocked Content
When a user requests to view an original image (via the `/access` endpoint), the backend performs strict **Ownership Validation**:
1. It verifies the user's identity via JWT.
2. It checks if the user is the original uploader (owner).
3. If not the owner, it checks if the user's `unlockedMedia` array contains the media ID.
4. Only if validation passes, the server generates a pre-signed URL with a strict expiration time of **60 seconds**.
This ensures that even if a user attempts to share the URL with a non-paying user, the URL will expire and become useless almost immediately.

### 5. Rate Limiting
To prevent brute-force attacks on the authentication endpoints and API abuse, `express-rate-limit` is configured to limit requests to the API.
