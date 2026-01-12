# Auth Service - PreProVision

## Description
Authentication and authorization microservice for the PreProVision system.
Provides user registration, login, and JWT-based authentication.

## Tech Stack
- Node.js
- Express
- SQLite (temporary database)
- JWT
- Docker

## Endpoints

### Register user
POST /auth/register

Body:
{
  "name": "John Doe",
  "email": "john@uce.edu.ec",
  "password": "123456",
  "role": "STUDENT"
}

### Login
POST /auth/login

Response:
{
  "token": "JWT_TOKEN"
}

## Run locally
```bash
npm install
npm run dev
