# RazorPay — Intelligent Payments. Smarter Decisions.

<p align="center">
  <img src="https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20PostgreSQL-06b6d4?style=flat-square" />
  <img src="https://img.shields.io/badge/AI-Groq%20LLaMA%203-7c3aed?style=flat-square" />
  <img src="https://img.shields.io/badge/Auth-JWT%20Bearer-10b981?style=flat-square" />
  <img src="https://img.shields.io/badge/Docker-Compose%20Ready-2496ed?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square" />
</p>

> A production-grade AI-powered personal finance platform built for the **RazorPay Hackathon**. RazorPay helps users track transactions, set smart budgets, detect anomalies, and get personalized financial advice through a conversational AI assistant.

---

## ✨ Feature Highlights

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure register/login with bcrypt hashing and 7-day rolling tokens |
| 💳 **Transaction Engine** | Full CRUD with category, type, method, date filters and pagination |
| 🤖 **AI Financial Assistant** | Real-time chat powered by Groq LLaMA 3 with rule-based fallback |
| 📊 **Analytics Hub** | Recharts-driven cashflow, category, and payment method visualizations |
| 💰 **Budget Limits** | Per-category monthly spending caps with 4-tier warning system |
| 🚨 **Anomaly Detector** | Auto-flags high-value or suspicious transactions as HIGH/MEDIUM risk |
| 💡 **Spending Auditor** | AI-generated financial health scores, risk lists, and recommendations |
| 👑 **Admin Panel** | Platform-wide user management, audit trails, and system stats |
| 🌙 **Dark/Light Mode** | Full theme persistence with `ThemeContext` |
| 🔔 **Live Notifications** | Server-side events polled every 20 seconds via `NotificationContext` |

---

## 🏗️ Tech Stack

### Backend
- **Node.js + Express** — REST API with centralized error handling
- **TypeScript** — Full type safety across all controllers and schemas
- **PostgreSQL + Prisma ORM** — Relational schema with cascading deletes
- **Groq SDK (LLaMA 3)** — AI Chat and spending analysis
- **Zod** — Runtime API request body validation
- **bcryptjs + jsonwebtoken** — Auth security primitives

### Frontend
- **React 18 + TypeScript** — Component-based UI with strict types
- **Vite** — Lightning-fast build tooling
- **Tailwind CSS** — Dark-mode-first utility styling
- **Recharts** — Interactive financial data visualizations
- **React Router v6** — Client-side navigation with protected routes
- **Axios** — HTTP client with Bearer token interceptors

### DevOps
- **Docker + Docker Compose** — Multi-service orchestration
- **Nginx** — Static asset serving + API reverse proxy
- **AWS Ready** — ECS, RDS, S3, CloudFront deployment blueprint

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/your-username/razorpay.git
cd razorpay

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Set up backend env
cp backend/.env.example backend/.env

# Set up frontend env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/razorpay?schema=public"
JWT_SECRET="your_super_secret_key_here"
PORT=5000
GROQ_API_KEY="gsk_..."   # Optional — falls back to rule-based AI if absent
```

Edit `frontend/.env`:

```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Set Up Database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start Development Servers

To run the application, start both services in separate terminal windows:

**Start backend:**
```bash
cd backend
npm run dev
```

**Start frontend:**
```bash
cd frontend
npm run dev
```

Visit **http://localhost:5173** to open RazorPay.

**Seeded demo credentials:**
- **Admin:** `admin@razorpay.com` / `admin123`
- **User:** `rahul@razorpay.com` / `user123`

---

## 🐳 Docker Deployment

```bash
# Build and launch all 3 services (frontend, backend, postgres)
docker compose up --build -d

# Run database migrations inside the backend container
docker compose exec server npx prisma migrate deploy
docker compose exec server npx prisma db seed
```

App runs at **http://localhost:80**

---

## ☁️ AWS Deployment Architecture

```
                        ┌─────────────────────────────────┐
          HTTPS         │  CloudFront CDN (React SPA)      │
Users ──────────────►  │  Origin: S3 Static Bucket        │
                        └──────────────┬──────────────────┘
                                       │ /api/* requests
                                       ▼
                        ┌─────────────────────────────────┐
                        │  Application Load Balancer       │
                        └──────────────┬──────────────────┘
                                       │
                        ┌─────────────────────────────────┐
                        │  ECS Fargate (Express Server)   │
                        │  Auto-scaling Task Group        │
                        └──────────────┬──────────────────┘
                                       │
                        ┌─────────────────────────────────┐
                        │  RDS PostgreSQL (Multi-AZ)      │
                        │  Private Subnet Only             │
                        └─────────────────────────────────┘
```

### Deployment Steps

1. **Frontend → S3 + CloudFront**
   ```bash
   npm run build --prefix frontend
   aws s3 sync frontend/dist s3://your-razorpay-bucket --delete
   aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
   ```

2. **Backend → ECS Fargate**
   ```bash
   # Build and push Docker image to ECR
   aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-uri>
   docker build -t razorpay-backend ./backend
   docker tag razorpay-backend:latest <ecr-uri>/razorpay-backend:latest
   docker push <ecr-uri>/razorpay-backend:latest
   # Then update your ECS service to use new image revision
   ```

3. **Database → RDS**
   - Launch PostgreSQL 16 on RDS in a private VPC subnet
   - Set `DATABASE_URL` in ECS task environment secrets (via AWS Secrets Manager)
   - Run migrations: `npx prisma migrate deploy`

---

## 📁 Project Structure

```
razorpay/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/ui/     # Shared design system components
│   │   ├── context/           # Theme, Auth, Notification providers
│   │   ├── layouts/           # AuthLayout, DashboardLayout
│   │   ├── pages/             # All page views
│   │   ├── router/            # React Router config
│   │   └── services/          # Axios API client functions
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                   # Express + Prisma backend
│   ├── src/
│   │   ├── config/            # DB + env config
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, validation, error
│   │   ├── routes/            # API route mapping
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── services/          # AI service (Groq)
│   │   └── utils/             # Anomaly detector, audit logger, JWT, bcrypt
│   ├── prisma/
│   │   ├── schema.prisma      # Full ORM schema
│   │   └── seed.ts            # Indian fintech demo data
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🔐 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Authenticate and receive JWT |
| GET | `/api/auth/me` | Get current session profile |
| PUT | `/api/auth/profile` | Update name/email/password |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | List with filters & pagination |
| POST | `/api/transactions` | Create new transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Remove transaction |

### Budgets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budgets` | List all user budgets with spent amounts |
| POST | `/api/budgets` | Create category budget limit |
| PUT | `/api/budgets/:id` | Update limit amount |
| DELETE | `/api/budgets/:id` | Remove budget |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/overview` | Summary stats (income, expenses, savings) |
| GET | `/api/analytics/trend` | Monthly income vs expense trend |
| GET | `/api/analytics/categories` | Spending breakdown by category |
| GET | `/api/analytics/payment-methods` | Payment method distribution |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/chat` | Chat with AI financial assistant |
| POST | `/api/ai/analyze` | Generate spending audit + health score |

### Admin (ADMIN role only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform-wide metrics |
| GET | `/api/admin/users` | All registered accounts |
| GET | `/api/admin/audit-logs` | Security audit trail |

---

## 🧪 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | HMAC secret for JWT signing |
| `PORT` | ✅ | Server port (default: 5000) |
| `GROQ_API_KEY` | ❌ | Groq API key for AI features (has fallback) |

---

## 📜 License

MIT — Built for the RazorPay Hackathon 2026 🚀