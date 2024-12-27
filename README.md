# Forum Application

<div align="center">

A modern, full-featured forum application built with Rails 7 API and React TypeScript.

[![Ruby](https://img.shields.io/badge/Ruby-3.x-red.svg)](https://www.ruby-lang.org/)
[![Rails](https://img.shields.io/badge/Rails-7.x-red.svg)](https://rubyonrails.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)

</div>

## 📑 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Initial Admin Setup](#initial-admin-setup)
- [System Architecture](#-system-architecture)
- [User Roles & Permissions](#-user-roles--permissions)
- [Development Guide](#-development-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Core Features
- **Authentication & Authorization**
  - JWT-based secure authentication
  - Role-based access control (Guest, User, Moderator, Admin)
  - Email-based registration
  - Password reset functionality
  - User banning system with reason tracking

- **Forum Structure**
  - Hierarchical categories with one level of subcategories
  - Chronological ordering of content
  - Threaded discussions with nested replies
  - Post editing with timestamp tracking
  - Thread locking/unlocking capabilities

- **Moderation System**
  - Category-specific moderation
  - Thread management (lock, move)
  - Content moderation (edit/delete)
  - User management with ban functionality

- **Search Functionality**
  - Context-aware search within categories
  - Real-time search suggestions
  - Cross-content search capabilities

### Technical Features
- PostgreSQL with proper indexing
- Transaction handling for critical operations
- Permission caching system
- Soft delete implementation
- N+1 query prevention with eager loading
- XSS and CSRF protection

## 💻 Technology Stack

### Backend
- Ruby 3.x
- Rails 7.x (API mode)
- PostgreSQL 12+
- JWT Authentication
- Active Record
- Action Mailer

### Frontend
- React 18.x
- TypeScript 5.x
- TanStack Query
- React Router 6
- Tailwind CSS
- ShadcnUI components

## 📋 Prerequisites

- Git
- Ruby 3.x
- Node.js 16+ and npm
- PostgreSQL 12+
- A text editor (VS Code recommended)
- Gmail account for email functionality

## 🔧 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/forum-app.git
   cd forum-app
   ```

2. **Install Ruby dependencies**
   ```bash
   gem install bundler
   bundle install
   ```

3. **Database Configuration**
   
   Create `config/database.yml`:
   ```yaml
   default: &default
     adapter: postgresql
     encoding: unicode
     pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
     username: your_postgres_username
     password: your_postgres_password

   development:
     <<: *default
     database: forum_development

   test:
     <<: *default
     database: forum_test
   ```

4. **Environment Variables**
   
   Create `.env` in the root directory:
   ```env
   GMAIL_USERNAME=your_email@gmail.com
   GMAIL_PASSWORD=your_app_specific_password
   SECRET_KEY_BASE=generate_using_rails_secret
   CORS_ORIGINS=http://localhost:3001
   ```

5. **Database Setup**
   ```bash
   rails db:create
   rails db:migrate
   ```

6. **Start the Rails server**
   ```bash
   rails s
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm start
   ```

### Initial Admin Setup

1. **Register a new user**
   - Visit `http://localhost:3001/register`
   - Create an account with your email and password

2. **Access Rails console**
   ```bash
   rails c
   ```

3. **Make user an admin**
   ```ruby
   # Find your user
   user = User.find_by(email: 'your@email.com')
   
   # Make them an admin
   user.update(role: 'admin')
   
   # Verify the change
   user.reload.admin?  # Should return true
   ```

4. **Login and verify admin access**
   - Log out and log back in
   - You should see the Admin dashboard link
   - Access `/admin` to manage the forum

## 👥 User Roles & Permissions

### Guest (Not Logged In)
- View all categories and subcategories
- View all threads and posts
- Use search functionality
- Cannot create content or access protected routes

### User (Logged In)
- All guest privileges
- Create new threads
- Post replies (up to 3 levels deep)
- Edit/delete own content
- Access profile page
- Reset password
- Cannot create content if banned
- Cannot access moderation tools

### Moderator
- All user privileges
- Lock/unlock threads in moderated categories
- Move threads between moderated categories
- Moderate content within assigned categories and subcategories
- Cannot moderate unassigned categories
- Lose privileges if banned
- Cannot access admin features

### Administrator
- Full system access
- Access to admin dashboard
- Manage all categories and subcategories
- Manage user roles and permissions
- Ban/unban users
- Assign/remove moderators
- Full access to all moderation tools
- Not affected by ban status

## 🏗 System Architecture

### Database Schema

```ruby
# Key models and relationships

User
  has_many :forum_threads, foreign_key: "author_id"
  has_many :posts, foreign_key: "author_id"
  has_many :moderator_assignments
  has_many :moderated_categories, through: :moderator_assignments

Category
  belongs_to :parent_category, optional: true
  has_many :subcategories, foreign_key: "parent_category_id"
  has_many :moderator_assignments
  has_many :moderators, through: :moderator_assignments
  has_many :forum_threads

ForumThread
  belongs_to :category
  belongs_to :author
  has_many :posts

Post
  belongs_to :thread
  belongs_to :author
  belongs_to :parent, optional: true
  has_many :replies, foreign_key: "parent_id"
```

## 🛠 Development Guide

### Code Organization

```
app/
├── controllers/
│   ├── admin/
│   ├── api/
│   └── application_controller.rb
├── models/
├── serializers/
└── services/

frontend/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── types/
│   └── utils/
```

## ❗ Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo service postgresql status

   # Reset database
   rails db:drop db:create db:migrate
   ```

2. **JWT Token Issues**
   - Clear browser storage
   - Check token expiration
   ```ruby
   JsonWebToken.decode(token)
   ```

3. **Permission Issues**
   ```ruby
   # Rails console
   user.reload  # Refresh user object
   user.role    # Check current role
   user.moderated_categories  # Check moderated categories
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
