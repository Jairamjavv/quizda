# Quizda

## Quizda is a combination of two words - Quiz + Data.

A full-stack quiz application with advanced analytics, designed for creating, taking, and analyzing quizzes with data-driven insights.

---

## 🎯 Project Overview

**Quizda** is a comprehensive quiz platform that combines interactive quiz-taking with powerful analytics. It features a React frontend and Node.js/Express backend, designed for both learners and administrators to create, manage, and analyze quiz performance.

### Key Highlights

- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 📊 **Advanced Analytics** - SWOT analysis, learning streaks, tag-based performance tracking
- 👥 **Multi-Role System** - Separate interfaces for users and administrators
- 🎯 **Flexible Quiz System** - Support for multiple question types with tagging
- 📈 **Performance Tracking** - Detailed metrics and personalized insights
- ✅ **Fully Tested** - 46 automated tests covering all 19 API endpoints

---

## 🏗️ Architecture

### Frontend (Client)

- **Framework**: React + TypeScript + Vite
- **Location**: `/client` directory
- **Features**:
  - Quiz taking interface
  - Personal dashboard with analytics
  - Admin panel for content management
  - User authentication and registration

### Backend (Server)

- **Runtime**: Node.js + Express + TypeScript
- **Databases**:
  - PostgreSQL (users, attempts)
  - MongoDB (quizzes, questions, groups)
- **API**: RESTful with JWT authentication
- **Location**: `/server` directory

---

## 🗂️ Backend API Structure

### Endpoints (19 total)

#### 🔓 Public Routes

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication

#### 👤 User Routes (Auth Required)

- `GET /quizzes` - List all published quizzes
- `GET /quizzes/:id` - Get specific quiz details
- `GET /quizzes/:id/questions` - Get quiz questions
- `POST /quizzes/:id/attempt` - Submit quiz attempt
- `GET /dashboard` - User analytics dashboard
- `GET /dashboard?groupId=X` - Filtered analytics by group

#### 👨‍💼 Admin Routes (Admin Role Required)

**Quiz Management:**

- `GET /admin/quizzes` - List all quizzes
- `GET /admin/quizzes/:id` - Get quiz details
- `POST /admin/quizzes` - Create new quiz
- `PUT /admin/quizzes/:id` - Update quiz
- `DELETE /admin/quizzes/:id` - Delete quiz

**Question Management:**

- `GET /admin/questions/:quiz_id` - List questions for quiz
- `POST /admin/questions` - Create question
- `PUT /admin/questions/:id` - Update question
- `DELETE /admin/questions/:id` - Delete question

**Group Management:**

- `GET /admin/groups` - List all groups
- `GET /admin/groups/:id` - Get group details
- `POST /admin/groups` - Create group
- `PUT /admin/groups/:id` - Update group
- `DELETE /admin/groups/:id` - Delete group

---

## 📦 Data Models

### PostgreSQL Models

1. **User** - User accounts, authentication, roles (user/admin)
2. **Attempt** - Quiz attempt records, scores, timestamps

### MongoDB Models

1. **Quiz** - Quiz metadata, publishing status, groups
2. **Question** - Question content, types, choices, tags, points
3. **Group** - Quiz organization and categorization
4. **Tag** - Topic-based tagging system

---

## 🎓 Key Features

### For Learners:

- ✅ Browse and take published quizzes
- 📊 Personal analytics dashboard
- 🔥 Learning streak tracking
- 📈 SWOT analysis of performance (Strengths, Weaknesses, Opportunities, Threats)
- 🏷️ Tag-based performance insights
- 📉 Progress tracking over time

### For Administrators:

- ✏️ Full CRUD operations for quizzes, questions, and groups
- 🎯 Multiple question type support
- 📋 Content organization with groups
- 🔄 Publish/unpublish control
- 🏷️ Tag management for categorization

---

## 🔧 Technical Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router

### Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL (via `pg`)
- MongoDB (via `mongodb`)
- JWT for authentication
- bcrypt for password hashing

### Testing

- Jest
- Supertest
- ts-jest
- 46 tests covering all endpoints
- 74.8% route coverage

---

## 🧪 Testing

Comprehensive endpoint testing with:

- ✅ **46 tests** across 4 test suites - All passing
- ✅ **19 endpoints** fully tested
- ✅ **Coverage**: Routes 74.8%, Middleware 94.44%
- ✅ Jest + Supertest with mocked database calls

### Test Suites:

- `__tests__/auth.test.ts` - Authentication (6 tests)
- `__tests__/quiz.test.ts` - Quiz operations (9 tests)
- `__tests__/admin.test.ts` - Admin operations (21 tests)
- `__tests__/dashboard.test.ts` - Analytics (10 tests)

**Run Tests:**

```bash
cd server
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
npm run test:watch      # Run in watch mode
```

See `server/TEST_GUIDE.md` for detailed testing documentation.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- MongoDB

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Jairamjavv/quizda.git
   cd quizda
   ```

2. **Setup Backend**

   ```bash
   cd server
   npm install

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials

   # Initialize databases
   npm run prestart

   # Start server
   npm run dev
   ```

3. **Setup Frontend**

   ```bash
   cd client
   npm install

   # Start development server
   npm run dev
   ```

---

## 📝 Environment Variables

### Server `.env`

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/quizda

# MongoDB
MONGO_URI=mongodb://localhost:27017/quizda

# JWT
JWT_SECRET=your-secret-key-here

# Server
PORT=4000
```

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Role-based authorization (RBAC)
- ✅ bcrypt password hashing
- ✅ Protected routes with middleware
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📊 Analytics Features

The dashboard provides:

- **Total Quizzes Taken** - Overall activity count
- **Learning Streak** - Consecutive days of quiz activity
- **Average Score** - Performance percentage across all quizzes
- **Tag Statistics** - Performance breakdown by topic
- **SWOT Analysis** - Personalized learning insights
  - Strengths: High-performing topics
  - Weaknesses: Areas needing improvement
  - Opportunities: Suggested focus areas
  - Threats: Risk areas requiring attention

---

## 📚 Documentation

- `QUESTION_TYPES_GUIDE.md` - Supported question formats
- `server/TEST_GUIDE.md` - Testing documentation and examples
- API documentation available via Swagger at `/api-docs` (when server is running)

---

## 🛠️ Development

### Server Development

```bash
cd server
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start            # Start production server
npm test             # Run tests
```

### Client Development

```bash
cd client
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 📁 Project Structure

```
quizda/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── pages/         # Page components
│   │   │   └── admin/     # Admin pages
│   │   └── assets/        # Static assets
│   └── public/
│
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   │   ├── auth.ts       # Authentication routes
│   │   ├── quiz.ts       # Quiz routes
│   │   ├── admin.ts      # Admin routes
│   │   └── dashboard.ts  # Dashboard routes
│   ├── models/           # Data models
│   │   ├── user.ts       # User model (PostgreSQL)
│   │   ├── attempt.ts    # Attempt model (PostgreSQL)
│   │   ├── quiz.ts       # Quiz model (MongoDB)
│   │   ├── question.ts   # Question model (MongoDB)
│   │   ├── group.ts      # Group model (MongoDB)
│   │   └── tag.ts        # Tag model (MongoDB)
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT authentication
│   │   └── role.ts       # Role-based access control
│   ├── __tests__/        # Test suites
│   ├── db.ts             # PostgreSQL connection
│   ├── mongo.ts          # MongoDB connection
│   ├── init_db.ts        # PostgreSQL initialization
│   └── init_mongo_quiz.ts # MongoDB initialization
│
├── QUESTION_TYPES_GUIDE.md
└── README.md
```

---

## 📚 Documentation

For complete documentation including setup, authentication, session management, deployment, and troubleshooting, see **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

**Quick Links:**

- [Quick Start Guide](./DOCUMENTATION.md#2-quick-start)
- [Environment Setup](./DOCUMENTATION.md#3-environment-setup)
- [Design System](./DOCUMENTATION.md#4-design-system)
- [Question Types](./DOCUMENTATION.md#5-question-types)
- [Authentication](./DOCUMENTATION.md#6-authentication)
- [Session Management V2](./DOCUMENTATION.md#7-session-management)
- [Migration Guides](./DOCUMENTATION.md#8-migration-guides)
- [Deployment to Render](./DOCUMENTATION.md#9-deployment)
- [Troubleshooting](./DOCUMENTATION.md#10-troubleshooting)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

---

## 👤 Author

**Jairam Javv**

- GitHub: [@Jairamjavv](https://github.com/Jairamjavv)

---

## 🎯 Roadmap

- [ ] Additional question types (essay, matching, etc.)
- [ ] Real-time quiz competitions
- [ ] Social features (leaderboards, sharing)
- [ ] Mobile app
- [ ] Advanced analytics and reporting
- [ ] Quiz recommendations based on performance
- [ ] Gamification features (badges, achievements)

---

**Built with ❤️ for data-driven learning**
