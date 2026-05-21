#  Hotel Booking Platform

A hotel booking platform developed for the **SE4458** course.

The application is built using a **microservice architecture** and supports hotel management, hotel searching, booking operations, comments & ratings, notifications, and an AI-powered booking assistant.

---

##  Deployed URLs

| Service | URL |
|---|---|
| Frontend | http://hotel-booking-frontend-ilayda.s3-website.eu-central-1.amazonaws.com/admin |
| API Gateway | http://3.75.92.253:3000 |
| Hotel Service | http://63.180.228.164:3001 |
| Comments Service | http://3.79.100.92:3002 |
| Notification Service | http://18.157.168.15:3003 |
| AI Agent Service | http://63.177.235.154:3004 |

##  Demo Video Link

Demo video link will be pasted here

#  Features

##  Hotel Admin Panel
- Admin authentication
- Add and update hotels
- Manage room types and capacities
- Configure room availability between selected dates
- Hotel occupancy management

---

##  Hotel Search
- Search hotels by:
  - destination
  - date range
  - guest count
- Display only available hotels
- Logged-in users receive **15% discounted prices**
- Interactive map support for hotel locations

---

##  Booking System
- View hotel details
- Book rooms for selected dates
- Automatic room capacity updates after reservation
- Reservation confirmation flow

---

##  Comments & Ratings
- Hotel reviews and ratings
- Average score calculations
- Rating distribution graphs
- Category-based scoring:
  - cleanliness
  - facilities
  - service quality
  - location
  - eco-friendliness

---

##  Notification Service
Background services for:
- Sending reservation confirmations
- Nightly occupancy checks
- Alerting hotel admins when hotel occupancy falls below 20%
- Queue-based asynchronous processing

---

##  AI Booking Assistant
AI-powered hotel assistant capable of:
- Searching hotels using natural language
- Suggesting hotels based on preferences
- Guiding users through booking flow
- Communicating with backend APIs using tool/function calls

---

#  System Architecture

The project follows a distributed microservice architecture.

```text
Frontend (React)
        │
        ▼
API Gateway
        │
 ┌──────┼───────────┐
 ▼      ▼           ▼
Hotel  Comments   AI Agent
Service Service    Service
   │
   ▼
RabbitMQ Queue
   │
   ▼
Notification Service
```

---

#  Technologies Used

| Layer | Technologies |
|---|---|
| Frontend | React, React Router, Axios, Leaflet |
| Backend | Node.js, Express.js |
| Authentication | Firebase Authentication |
| Relational Database | PostgreSQL |
| NoSQL Database | MongoDB Atlas |
| Cache | Redis / Upstash |
| Queue System | RabbitMQ (CloudAMQP) |
| Scheduler | node-cron |
| AI Integration | Anthropic Claude API |
| Deployment | AWS EC2, AWS S3, AWS RDS |
| Containerization | Docker |

---

#  Services

## Hotel Service
Handles:
- hotel CRUD operations
- room management
- availability management
- hotel searching
- reservation processing

### Example Endpoints

```http
GET    /api/v1/hotels
GET    /api/v1/hotels/:id
POST   /api/v1/bookings
GET    /api/v1/search
```

---

## Comments Service
Handles hotel comments and ratings stored in MongoDB.

### Example Endpoints

```http
GET    /api/v1/comments/:hotelId
POST   /api/v1/comments
```

---

## Notification Service
Responsible for:
- reservation confirmation emails
- scheduled occupancy monitoring
- RabbitMQ consumer operations

---

## AI Agent Service
Natural language hotel booking assistant.

### Example Endpoint

```http
POST /api/v1/agent/chat
```

---

#  Authentication

Authentication is implemented using **Firebase Authentication**.

Features:
- JWT-based protected routes
- Admin and client roles
- Secure reservation operations
- Discount support for authenticated users

---

#  Caching

Hotel search responses are cached using Redis to:
- reduce database load
- improve response time
- optimize repeated searches

---

#  Queue System

RabbitMQ is used for asynchronous communication between services.

Example:
- Hotel Service publishes reservation events
- Notification Service consumes events and sends emails

---

#  Map Integration

The frontend includes an interactive hotel map built with:
- Leaflet.js
- OpenStreetMap

Hotels are displayed using latitude and longitude coordinates.

---

#  Data Storage

## PostgreSQL
Used for:
- hotels
- rooms
- users
- bookings
- room availability

## MongoDB Atlas
Used for:
- comments
- ratings
- review analytics

---

#  Design Decisions

- Payment integration was intentionally omitted based on assignment requirements
- PostgreSQL was selected instead of SQLite for scalability
- Comments are stored separately in MongoDB as required
- Firebase Authentication was preferred over Cognito for simplicity
- Redis caching was added to improve hotel search performance
- RabbitMQ was used for asynchronous reservation notifications

---

#  Local Setup

## Clone Repository

```bash
git clone https://github.com/your-username/hotel-booking.git
cd hotel-booking
```

---

## Install Dependencies

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend Services

```bash
cd services/hotel-service
npm install
npm run dev
```

Repeat for all services.

---

#  Docker

Each service contains its own Dockerfile.

Example:

```bash
docker build -t hotel-service ./services/hotel-service
```

---

#  Project Structure

```text
hotel-booking/
│
├── frontend/
├── gateway/
├── services/
│   ├── hotel-service/
│   ├── comments-service/
│   ├── notification-service/
│   └── ai-agent-service/
│
├── docker/
└── README.md
```

---

#  Deployment

The project is designed for cloud deployment using AWS services.

Used cloud services:
- AWS EC2
- AWS S3
- AWS RDS
- CloudAMQP
- Upstash Redis

---

#  Assumptions

- No payment processing implemented
- Email notifications are asynchronous
- Availability updates happen automatically after booking
- AI assistant communicates through backend APIs

---

#  Developer

**İlayda Gün**  
Software Engineering — Yaşar University
