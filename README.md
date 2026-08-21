# DevVerse

> A full-stack developer community platform for real-time discussions,
> collaboration, and developer networking.

## 🚀 Live Demo
https://devverse-67gp.onrender.com/

## ✨ Features

- 🔐 JWT-based Authentication & Authorization
- 👥 Developer Community & Discussions
- 💬 Real-time communication with Socket.IO / WebSockets
- 📸 Media uploads with AWS S3
- ⚡ Redis caching
- 🔄 Background job processing with BullMQ
- 🐳 Dockerized services
- ☸️ Kubernetes-ready architecture
- 🔒 RBAC & protected REST APIs
- 📄 Pagination and optimized database queries

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Redux Toolkit
- Tailwind CSS

### Backend
- Node.js
- Express.js
- REST APIs
- JWT
- Socket.IO

### Database & Caching
- MongoDB
- Mongoose
- Redis

### DevOps & Cloud
- Docker
- Kubernetes
- AWS S3
- AWS EC2

### Tools
- Git
- GitHub
- Postman
- JIRA

## 🏗️ Architecture

```text
React.js Client
      │
      ▼
Express.js REST API
      │
 ┌────┼─────────────┐
 ▼    ▼             ▼
MongoDB Redis      AWS S3
      │
      ▼
   BullMQ
      │
      ▼
Background Workers

        │
        ▼
 Socket.IO / WebSockets
