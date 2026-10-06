# MotorGuard — Vehicle Insurance Management System

A full-stack web application where customers register vehicles, buy policies, pay premiums, file claims and store documents, and staff roles review and process that work.

## Tech stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Router, react-hook-form + Yup, Axios
- **Backend:** Java 17, Spring Boot 3.2 (Web, Security, Data JPA, Validation), JWT
- **Database:** PostgreSQL (Neon)

## Modules
| Module | Backend package | Customer page | Staff page |
|---|---|---|---|
| Customer & Auth | `customer`, `auth`, `user` | Profile | Customer directory |
| Vehicles | `vehicle` | My Vehicles | Vehicle registry |
| Policies | `policy` | My Policies | Policy management |
| Claims | `claim` | My Claims | Claims queue |
| Payments | `payment` | Payments | Payments ledger, Reports |
| Documents & Feedback | `document`, `feedback` | Documents, Feedback | Document monitor, Feedback overview |

Roles: `CUSTOMER`, `SUPERVISOR`, `CLAIMS_OFFICER`, `OPERATIONS_MANAGER`, `BRANCH_MANAGER`, `FINANCE_EXECUTIVE`.

## Prerequisites
Java 17, Maven, Node.js 18+, and a PostgreSQL database (Neon).

## Running the backend
Set these environment variables (never commit them):

| Variable | Meaning |
|---|---|
| `SPRING_DATASOURCE_URL` | JDBC URL, e.g. `jdbc:postgresql://<host>/<db>?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `JWT_SECRET` | Long random string used to sign tokens |

```bash
cd backend
mvn spring-boot:run
```
The API runs on `http://localhost:8080`. Tables are created automatically, and one demo account per role is seeded on first start (see `DataSeeder.java`).

Unit tests: `mvn test`

## Running the frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`. Requests to `/api` are proxied to the backend.
