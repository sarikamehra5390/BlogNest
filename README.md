# 📝 BlogNest

> A modern full-stack blogging platform for creating, managing, and discovering blog posts.

BlogNest is a full-stack blogging application built with React and Appwrite. It provides users with a simple and modern platform to create accounts, publish blogs, manage their content, and explore posts from other users.

## ✨ Features

- 🔐 **User Authentication** — Register and log in securely using Appwrite Authentication
- ✍️ **Create Blogs** — Write and publish blog posts
- 📖 **Read Blogs** — Explore and read published posts
- 📝 **Edit Blogs** — Update your own posts
- 🗑️ **Delete Blogs** — Remove your own posts
- 👤 **User Accounts** — Manage content associated with authenticated users
- 🔍 **Blog Discovery** — Browse available blog posts
- 📱 **Responsive Design** — Optimized for different screen sizes
- ⚡ **Fast Development** — Built with React and Vite
- 🎨 **Modern UI** — Clean and responsive user interface

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Appwrite SDK

### Backend & Database

- **Appwrite**
  - Authentication
  - Databases
  - API services
  - User management
  - File storage

### Development Tools

- Git
- GitHub
- VS Code
- Vite

## 📂 Project Structure

```text
BlogNest/
│
├── src/
│   ├── appwrite/
│   │   ├── auth.js
│   │   ├── config.js
│   │   └── database.js
│   │
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── .env
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd BlogNest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Appwrite

Create an Appwrite project and configure the required authentication and database services.

Add your Appwrite configuration to the project's environment variables.

```env
VITE_APPWRITE_URL=your_appwrite_endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
```

> Never expose private Appwrite API keys or other sensitive credentials in your frontend environment.

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## 🔄 Application Architecture

```text
┌──────────────────────┐
│      React App       │
│   Vite + Tailwind    │
└──────────┬───────────┘
           │
           │ Appwrite SDK
           ▼
┌──────────────────────────────┐
│           Appwrite           │
│                              │
│  ┌──────────┐ ┌───────────┐ │
│  │   Auth   │ │ Database  │ │
│  └──────────┘ └───────────┘ │
│                              │
│  ┌──────────┐ ┌───────────┐ │
│  │ Storage  │ │   APIs    │ │
│  └──────────┘ └───────────┘ │
└──────────────────────────────┘
```

## 🔐 Authentication

BlogNest uses **Appwrite Authentication** for user management.

The authentication flow is:

```text
Register
   ↓
Appwrite Authentication
   ↓
Create User Session
   ↓
Authenticated User
   ↓
Access Protected Features
```

Users can create an account and log in through Appwrite. Authenticated users can then create and manage their own blog posts.

## 🗄️ Database

BlogNest uses **Appwrite Databases** to store application data.

A blog document can contain information such as:

```text
Blog
├── title
├── content
├── featuredImage
├── userId
├── authorName
└── createdAt
```

Appwrite's database permissions can be used to control which users can create, update, or delete documents.

## ✍️ Blog CRUD Operations

BlogNest implements the core CRUD operations:

```text
CREATE
  ↓
Create a new blog post

READ
  ↓
Display published blog posts

UPDATE
  ↓
Edit an existing blog post

DELETE
  ↓
Remove a blog post
```

## 🎯 Project Goals

The project was built to gain practical experience with:

- React application development
- Component-based UI design
- Authentication
- CRUD operations
- Database integration
- Appwrite SDK
- Protected user functionality
- Responsive web design
- Git and GitHub workflow

## 🔮 Future Improvements

- 💬 Comments and replies
- ❤️ Like and bookmark functionality
- 🔎 Blog search
- 🏷️ Categories and tags
- 👥 Follow authors
- 🖼️ Improved image management with Appwrite Storage
- 🌙 Dark mode
- 🔔 Notifications
- 📊 Author dashboard and analytics
- 🤖 AI-powered blog recommendations

## 🌐 Live Demo

**Live Website:** https://blog-nest-seven-self.vercel.app/

**GitHub Repository:** https://github.com/sarikamehra5390/BlogNest

## 👩‍💻 Author

**Sarika Mehra**

B.Tech Computer Science — Data Science

Building full-stack applications and exploring software development, data, and AI.

## 📄 License

This project is created for learning and portfolio purposes.
