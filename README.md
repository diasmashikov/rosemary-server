# Rosemary Server-side Application

## Introduction
The Rosemary Server-side Application powers the backend of the Rosemary e-commerce mobile application, providing robust support for a spectrum of CRUD operations. It manages item stock, financial statistics, orders, and user data, integrating seamlessly with MongoDB for database operations and AWS S3 for file storage. The system also includes a secure OTP system for number verification, in partnership with a local telecommunication company in Kazakhstan. At last, utilized Heroku for deployment procedures.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Usage](#usage)
- [Features](#features)

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- Parallel HTTP requests
- AWS S3
- JSON Web Tokens (JWT) for Authentication
- Local Telecommunication API for OTP
- Postman
- Heroku

## Usage
1. Start the server with `npm start`. Ensure MongoDB and AWS services are configured properly.
2. The server will start, and you can begin making requests to the endpoints provided for CRUD operations.
3. Utilize Postman or any API testing tool to test the API endpoints.

## Features
- Comprehensive CRUD operations for items, orders, and users
- Financial statistics analysis and reporting
- User authentication and authorization with JWT
- Integration with AWS S3 for file storage
- OTP verification system for user number verification

## Demonstration
- Postman API endpoints and collections of the MongoDB Database
<img width="300" height="600" alt="Screenshot 2024-02-08 at 22 16 00" src="https://github.com/diasmashikov/rosemary_server/assets/50723693/d2219738-b0bd-4d03-9af0-6aacea7d1d29">
<img width="300" height="600" alt="Screenshot 2024-02-08 at 22 18 51" src="https://github.com/diasmashikov/rosemary_server/assets/50723693/468d1532-8baf-4cd6-b9bf-922476b0a99e">
<img width="300" height="600" alt="Screenshot 2024-02-08 at 22 21 28" src="https://github.com/diasmashikov/rosemary_server/assets/50723693/9723a9be-f328-48e4-8b70-a9f2dda2ab29">



