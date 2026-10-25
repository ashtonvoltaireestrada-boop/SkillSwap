# Community Skill Swap Platform (Knoxite Hub) - Thesis Features Documentation

## Overview
A comprehensive peer-to-peer skill exchange platform demonstrating advanced concepts in recommendation systems, full-stack web development, community management, and educational technology.

## Total Features: 24+ Complete Pages

### Core Authentication & User Management
1. **Login Page** (`/`) - Secure JWT user authentication
2. **Signup Page** (`/signup`) - New user registration with encrypted passwords
3. **Profile Page** (`/profile`) - User profile management with **Sign Out functionality**
4. **Dashboard** (`/dashboard`) - Main hub with navigation and real-time active swap tracking
5. **My Skills** (`/my-skills`) - Comprehensive skill management system synced to the database

### Skill Exchange Features
6. **Marketplace/KnoxHub** (`/knox-hub`) - Browse available skill offerings
7. **Skill Radar** (`/dashboard`) - See and respond to skill requests
8. **Swap Agreements** (`/swap-agreement`) - Formalize skill exchange contracts with session limits
9. **Swap Details** (`/swap-details`) - Active session tracking and completion logging
10. **Calendar** (`/calendar`) - Schedule and track sessions ## soon to come ##
11. **Chat System** (`/chat`) - Messaging between matched users

### Trust & Safety Systems
12. **Reputation System** (`/reputation`) - User ratings and bilateral feedback logic
15. **Security Settings** (`/security`) - Privacy and account security ## soon to come ##
16. **User Reporting** (`/report`) - Report inappropriate behavior ## soon to come ##
17. **Privacy Policy** (`/privacy`) - Terms and data handling ## soon to come ##

### Engagement & Gamification
18. **Leaderboard** (`/leaderboard`) - Live database aggregation ranking top mentors and highest volume swappers

### Analytics & Insights
21. **Notification Center** (`/notification`) - Smart notification system tracking pending swap requests
22. **Admin Analytics Dashboard** (`/analytics`) - insights featuring learning progress and activity patterns

### Community Features
23. **Community Forum** (`/community-forum`) - Live discussion boards with categorized threads and comments
24. **Admin Dashboard** (`/admin-dashboard`) - Secure platform management for users with 'ADMIN' roles

## Key Academic Concepts Demonstrated

### 1. Context-Aware Recommendation System
- **Match Percentage Algorithm**: Calculates compatibility based on exact relational matches between offered and wanted skills.
- **Smart Suggestions**: Queries the database to exclude users already in an active rotation.

### 2. Peer-to-Peer Communication Module
- **Notification System**: Checks database status to trigger unread request alerts.
- **Activity Timeline**: Complete history of user interactions.

### 3. Trust & Verification Framework
- **Bilateral Review Logic**: Swaps are only marked "COMPLETED" when both parties submit a review.
- **Reputation Algorithm**: Weighted average scoring calculated dynamically from the database.

### 4. Full-Stack Data Aggregation
- **Live Leaderboards**: Utilizes Prisma `_count` aggregations to rank users securely on the backend without overloading the frontend.

## Technical Implementation Highlights

### Backend Architecture (The Engine)
- **Node.js & Express**: Robust RESTful API architecture
- **Prisma ORM**: Type-safe database schema management and querying
- **MySQL Database**: Relational data storage for users, swaps, skills, and forums
- **JWT Authentication**: Secure token-based route protection (`authenticateToken` middleware)

### Frontend Architecture (The Client)
- **React** with TypeScript
- **React Router** for protected and admin-level routing
- **Component-based** architecture using Tailwind CSS and Lucide Icons
- **Dynamic State Management**: Fetch API calls synced with React `useEffect` and `useState`

### Key User Flows
1. **The Core Loop**: Sign Up → Add Skills → View Skill Radar → Send Request → Partner Accepts in Notifications → Finalize Swap Agreement → Log Sessions → Submit Review → Earn Rating.
2. **Community Interaction**: Open Forum → Select Category → Start Thread → Receive Comments from Peers.

## Future Enhancement Possibilities
1. **Real-time WebSockets**: Upgrade standard API polling to WebSocket integration for live chat.
2. **Payment Integration**: Premium features or system credits.
3. **Mobile Apps**: Native iOS/Android applications.
4. **AI Matching**: Machine learning algorithms for advanced skill compatibility.

## Code Statistics
- **24+ Pages**: Complete, production-ready interfaces
- **Secure Backend API**: Dozens of protected endpoints handling business logic
- **100% TypeScript**: Type-safe development across the entire stack
