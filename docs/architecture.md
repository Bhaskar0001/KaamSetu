# System Architecture

## Overview
The Labour Platform is a comprehensive workforce management system designed for the Indian market, focusing on offline-first capabilities, fraud prevention, and role-based access.

## High-Level Components

### Frontend (React 18)
- **Worker Panel**: Mobile-first, voice-enabled, simplified UI.
- **Thekedar Panel**: Dashboard for managing pools of workers.
- **Owner Panel**: Job posting and monitoring.
- **Admin Panel**: High-level control and fraud monitoring.
- **Shared UI**: Reusable components.
- **Offline Module**: Service workers + IndexedDB for data persistence.

### Backend (Node.js + Express)
- **API Gateway**: Single entry point handling routing and rate limiting.
- **Auth Service**: JWT-based authentication.
- **Core Services**: Users, Jobs, Attendance, Contracts, Payments.
- **Engines**: 
    - **Fraud Engine**: Real-time risk analysis.
    - **AI Matching**: Connects workers to jobs.

## Database (MongoDB Atlas)
- **Users Collection**: Stores all role profiles.
- **Jobs Collection**: Job listings and metadata.
- **Attendance Collection**: Geo-tagged, face-verified records.
- **Audit Logs**: Immutable record of all actions.

## Infrastructure
- **Redis**: Caching and Job Queues (BullMQ).
- **Object Storage**: For profile photos and documents.
