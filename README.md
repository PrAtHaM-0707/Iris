# Iris AI Chatbot

Iris AI is a full-stack MERN chatbot application that enables users to chat with an advanced AI assistant, manage profiles, view chat history, and subscribe to flexible credit-based plans. The project features authentication (including Google OAuth), secure profile management, and a modern, responsive UI.

## Features

- **AI Chat**: Natural conversations with AI, supporting text and image messages.
- **User Authentication**: Email/password and Google OAuth login/register.
- **Profile Management**: Update avatar, bio, personal info, and security settings.
- **Credit System**: Daily credits based on subscription plan; upgrade plans via Razorpay.
- **Chat History**: Save, view, and delete chat conversations.
- **Responsive UI**: Built with React, Tailwind CSS, and Radix UI components.
- **Notifications**: Toasts for feedback and alerts.
- **Security**: Two-factor authentication and privacy controls.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI, React Router
- **Backend**: Node.js, Express, TypeScript, TypeORM, PostgreSQL
- **Payments**: Razorpay integration
- **Cloud Storage**: Cloudinary for avatar uploads
- **Authentication**: JWT, Google OAuth

## Project Structure

### Frontend ([frontend/](frontend))
- `src/components/`: UI and modal components
- `src/pages/`: Main app pages (Chat, Profile, Settings, Plans, etc.)
- `src/contexts/`: React context providers (Auth, Chat, Credits, Theme)
- `src/services/api.ts`: Axios API client
- `src/lib/utils.ts`: Utility functions
- `public/`: Static assets

### Backend ([backend/](backend))
- `src/controllers/`: Express route controllers
- `src/models/`: TypeORM entities (User, ChatHistory, Message, Credits)
- `src/routes/`: API route definitions
- `src/services/`: Email and other backend services
- `src/middlewares/`: Express middlewares
- `src/data-source.ts`: TypeORM data source config
- `src/server.ts`: App entry point

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- [Razorpay](https://razorpay.com/) account for payments
- [Cloudinary](https://cloudinary.com/) account for image uploads

### Setup

#### 1. Clone the repository

```sh
git clone https://github.com/PrAtHaM-0707/Iris.git
cd mern-chatbot
```

#### 2. Configure Environment Variables

Create `.env` files in both `frontend/` and `backend/` folders.  
See `.env.example` for required variables (API URLs, DB connection, Razorpay, Cloudinary, Google OAuth).

#### 3. Install Dependencies

```sh
cd backend
npm install
cd ../frontend
npm install
```

#### 4. Run Database Migrations

```sh
cd backend
npm run typeorm migration:run
```

#### 5. Start Backend Server

```sh
cd backend
npm run dev
```

#### 6. Start Frontend

```sh
cd frontend
npm run dev
```

You can try Iris AI live at:  
[https://iris-rho-three.vercel.app/](https://iris-rho-three.vercel.app/)

## Usage

- Register or login to start chatting.
- Manage your profile and settings.
- Upgrade your plan for more daily credits.
- View and manage chat history.

---

**Note:**  
- The backend may take 10–30 seconds to wake up if hosted on free tiers.
- For production, set up SSL, environment variables, and secure deployment.
