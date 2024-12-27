# Forum Application

<div align="center">

![Forum Logo](./docs/images/logo.png)

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
- [API Documentation](#-api-documentation)
- [Development Guide](#-development-guide)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Core Features
- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Moderator, User)
  - Password reset functionality
  - User banning system

- **Forum Structure**
  - Nested categories (up to 1 level deep)
  - Threaded discussions
  - Nested replies (up to 3 levels deep)
  - Post editing with edit history
  - Thread locking/unlocking

- **Moderation Tools**
  - Category-based moderation
  - Thread moving between categories
  - Content moderation (edit/delete)
  - User management

- **Search Functionality**
  - Real-time search suggestions
  - Full-text search across categories, threads, and posts
  - Context-aware search within categories/threads

### Additional Features
- Responsive design
- Error handling & validation
- Loading states & optimistic updates
- Cross-browser compatibility
- Mobile-friendly interface

## 💻 Technology Stack

### Backend
- Ruby 3.x
- Rails 7.x (API mode)
- PostgreSQL 12+
- JWT for authentication
- Active Record for ORM
- Action Mailer for emails

### Frontend
- React 18.x
- TypeScript 5.x
- TanStack Query for API state management
- React Router 6 for routing
- Tailwind CSS for styling
- ShadcnUI components
- Axios for API requests

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- Git
- Ruby 3.x
- Node.js 16+ and npm
- PostgreSQL 12+
- A text editor (VS Code recommended)
- Gmail account (for email functionality)

## 🔧 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/forum-app.git
   cd forum-app
   ```

2. **Install Ruby dependencies**
   ```bash
   # Install bundler if you haven't
   gem install bundler

   # Install dependencies
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

   production:
     <<: *default
     database: forum_production
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
   # Create databases
   rails db:create

   # Run migrations
   rails db:migrate

   # Optional: Seed the database
   rails db:seed
   ```

6. **Start the Rails server**
   ```bash
   # Start on port 3000
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
   
   Create `.env` in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3001`

### Initial Admin Setup

To set up the first admin user, follow these steps carefully:

1. **Register a new user**
   - Visit `http://localhost:3001/register`
   - Create an account with your email and password
   - Note down the email used

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

4. **Verify admin access**
   - Log out and log back in
   - You should now see an "Admin" link in the navigation
   - Visit `/admin` to access the admin dashboard

5. **Create initial categories**
   - Go to Admin > Categories
   - Create at least one category to start using the forum

## 🏗 System Architecture

### Database Schema

```ruby
# Key database relationships

User
  has_many :forum_threads, foreign_key: "author_id"
  has_many :posts, foreign_key: "author_id"
  has_many :moderator_assignments, class_name: "Moderator"
  has_many :moderated_categories, through: :moderator_assignments

Category
  belongs_to :parent_category, class_name: "Category", optional: true
  has_many :subcategories, class_name: "Category", foreign_key: "parent_category_id"
  has_many :moderator_assignments, class_name: "Moderator"
  has_many :moderators, through: :moderator_assignments
  has_many :forum_threads

ForumThread
  belongs_to :category
  belongs_to :author, class_name: "User"
  has_many :posts

Post
  belongs_to :thread, class_name: "ForumThread"
  belongs_to :author, class_name: "User"
  belongs_to :parent, class_name: "Post", optional: true
  has_many :replies, class_name: "Post", foreign_key: "parent_id"
```

## 👥 User Roles & Permissions

### Admin Role
- Full system access
- User management:
  - Create/edit users
  - Change user roles
  - Ban/unban users
- Category management:
  - Create/edit/delete categories
  - Assign moderators
- Content management:
  - Edit/delete any content
  - Lock/unlock threads
  - Move threads between categories

### Moderator Role
- Limited to assigned categories
- Cannot access admin dashboard
- Can:
  - Edit/delete posts in moderated categories
  - Lock/unlock threads
  - Move threads between moderated categories
  - Ban users from posting

### User Role
- Basic forum access
- Can:
  - Create threads and posts
  - Edit own content
  - Delete own content
  - View all public content

### Banned Users
- Can view content only
- Cannot:
  - Create new threads
  - Create new posts
  - Edit existing content

## 🔍 Search Functionality

The application implements a robust search system:

### Global Search
- Searches across all content types:
  - Categories
  - Threads
  - Posts
- Real-time suggestions
- Relevance-based results

### Contextual Search
- Category-specific search
- Thread-specific search
- Support for partial matches
- PostgreSQL full-text search

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

### Common Development Tasks

1. **Adding a New Feature**
   ```bash
   # Create a new branch
   git checkout -b feature/your-feature-name

   # Create necessary migrations
   rails generate migration AddFeatureName

   # Update frontend types
   # Update API endpoints
   # Add frontend components
   ```

2. **Running Tests**
   ```bash
   # Backend tests
   rspec

   # Frontend tests
   cd frontend && npm test
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
   - Check token expiration in Rails console
   ```ruby
   JsonWebToken.decode(token)
   ```

3. **CORS Issues**
   - Verify CORS configuration in `config/initializers/cors.rb`
   - Check API URL in frontend `.env`

4. **Permission Issues**
   ```ruby
   # Rails console
   user.reload  # Refresh user object
   user.role    # Check current role
   ```

## 🚀 Deployment

### Backend Deployment

1. **Heroku**
   ```bash
   # Create Heroku app
   heroku create your-app-name

   # Add PostgreSQL
   heroku addons:create heroku-postgresql

   # Configure environment variables
   heroku config:set RAILS_MASTER_KEY=`cat config/master.key`
   heroku config:set GMAIL_USERNAME=your@email.com
   heroku config:set GMAIL_PASSWORD=your_password

   # Deploy
   git push heroku main

   # Run migrations
   heroku run rails db:migrate
   ```

2. **Other Platforms**
   - Set up database
   - Configure environment variables
   - Set up Rails master key
   - Deploy application code

### Frontend Deployment

1. **Build Production Assets**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Hosting Service**
   - Netlify
   - Vercel
   - Firebase Hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit changes
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push to branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Ruby on Rails](https://rubyonrails.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadcnUI](https://ui.shadcn.com/)
