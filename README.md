# Inventory Management System

A full-stack inventory management application built with Java Spring Boot and Next.js.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2, Spring Security, JWT, PostgreSQL, Redis
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Infrastructure:** Docker

---

## Prerequisites

Before running the project, make sure you have the following installed:

- [Java 17](https://adoptium.net/) (Temurin/OpenJDK recommended)
- [Maven](https://maven.apache.org/download.cgi)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required for PostgreSQL and Redis)
- [Node.js 18+](https://nodejs.org/en/download)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jjrmich/inventory-management.git
cd inventory-management
```

### 2. Start the database and cache

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running, then start the PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

To verify the containers are running:

```bash
docker ps
```

You should see `inventory-postgres` and `inventory-redis` listed.

To stop the containers when you're done:

```bash
docker-compose down
```

---

## Running the Backend

### Environment variables

The backend requires Google OAuth credentials to be set as environment variables. Create a file at `backend/.env`:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> To obtain these credentials, create a project in the [Google Cloud Console](https://console.cloud.google.com/) and set up an OAuth 2.0 client. Add `http://localhost:8080/login/oauth2/code/google` as an authorized redirect URI.

### Start the backend

```bash
cd backend
source .env
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`.

- Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## Running the Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## Default Ports

| Service    | Port  |
|------------|-------|
| Frontend   | 3000  |
| Backend    | 8080  |
| PostgreSQL | 5432  |
| Redis      | 6379  |

---

## Features

- JWT authentication with Google OAuth support
- Role-based access control (Admin, Manager, Staff)
- Product management with search and filtering
- Location/warehouse management
- Inventory tracking with transaction audit trail
- Low stock and overstock detection