# University Forum Application

<div align="center">

A full-featured university forum system with hierarchical categories, advanced moderation tools, and role-based access control.

[![Ruby](https://img.shields.io/badge/Ruby-3.x-red.svg)](https://www.ruby-lang.org/)
[![Rails](https://img.shields.io/badge/Rails-7.x-red.svg)](https://rubyonrails.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)

</div>

## 📑 Table of Contents
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Setup Instructions](#-setup-instructions)
- [Initial Configuration](#-initial-configuration)
- [User Roles & Permissions](#-user-roles--permissions)
- [Using the Application](#-using-the-application)
- [Troubleshooting](#-troubleshooting)

## 📁 Project Structure

```
forum-app/                      # Root directory (Rails backend)
├── app/
│   ├── controllers/
│   │   ├── admin/             # Admin controllers
│   │   ├── authentication_controller.rb
│   │   ├── categories_controller.rb
│   │   └── ...
│   ├── models/
│   └── serializers/
├── config/
├── db/
└── university-forum-client/    # React frontend
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── contexts/
    │   └── types/
    ├── package.json
    └── tsconfig.json
```

## 🚀 Features

### Search System
- Real-time context-aware search
- Smart suggestions while typing
- Global and scoped search capabilities
- Cross-content type searching
- PostgreSQL full-text search optimization

### Core Functionality
- Hierarchical category system with one level of subcategories
- Threaded discussions with up to 3 levels of nested replies
- Real-time search with context-aware suggestions
- Complete user management and moderation system
- Role-based access control with four distinct user roles

### Technical Features
- JWT-based authentication
- Permission caching system
- Soft delete implementation for posts
- Chronological ordering of all content
- PostgreSQL with optimized queries and proper indexing
- Transaction handling for data integrity

## 📋 Prerequisites

Before installation, ensure you have:

- Ruby 3.x
- Rails 7.x
- PostgreSQL 12+ installed and running
- Node.js 16+ and npm
- Git
- A text editor (VS Code recommended)
- Gmail account for email functionality

## 🔧 Setup Instructions

### Step 1: Clone and Configure Backend

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd forum-app
   ```

2. **Install Ruby dependencies**
   ```bash
   bundle install
   ```

3. **Configure database**
   
   Update `config/database.yml`:
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

4. **Set up environment variables**
   
   Create `.env` in the root directory:
   ```env
   GMAIL_USERNAME=your_email@gmail.com
   GMAIL_PASSWORD=your_app_specific_password
   SECRET_KEY_BASE=generate_using_rails_secret
   CORS_ORIGINS=http://localhost:3001
   ```

5. **Initialize database**
   ```bash
   rails db:create
   rails db:migrate
   ```

### Step 2: Configure Frontend

1. **Navigate to frontend directory**
   ```bash
   cd university-forum-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure frontend environment**
   
   Create `.env` in the university-forum-client directory:
   ```env
   REACT_APP_API_URL=http://localhost:3000
   ```

### Step 3: Start the Application

1. **Start the Rails server** (from the root directory)
   ```bash
   rails s -p 3000
   ```

2. **In a new terminal, start the React frontend** (from university-forum-client)
   ```bash
   cd university-forum-client
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## ⚙️ Initial Configuration

### Setting Up the First Admin User

This is crucial for full access to the application. Follow these steps carefully:

1. **Register a new user**
   - Visit http://localhost:3001/register
   - Create an account with your email and password
   - Note down the email used

2. **Access Rails console** (from the root directory)
   ```bash
   rails c
   ```

3. **Elevate user to admin**
   ```ruby
   # Find your user
   user = User.find_by(email: 'your@email.com')
   
   # Make them an admin
   user.update(role: 'admin')
   
   # Verify the change
   puts "User role: #{user.reload.role}"
   puts "Is admin?: #{user.admin?}"
   ```

4. **First-time admin tasks**
   - Log out and log back in
   - Visit http://localhost:3001/admin
   - Create initial categories
   - Set up any additional moderators

## 👥 User Roles & Permissions

### Guest (Not Logged In)
- View categories, threads, and posts
- Use search functionality
- Cannot create or interact with content

### Registered User
- Create new threads
- Post replies (up to 3 levels deep)
- Edit/delete own content
- Access profile settings
- Cannot create content if banned

### Moderator
- Moderate assigned categories and their subcategories
- Lock/unlock threads
- Move threads between moderated categories
- Edit/delete content in moderated areas
- Loses privileges if banned

### Administrator
- Full system access
- Manage categories and subcategories
- Manage user roles
- Ban/unban users
- Assign moderators
- Access admin dashboard
- Not affected by bans

## 🎯 Using the Application

### Admin Dashboard (/admin)

1. **Category Management**
   - Create main categories and subcategories
   - Edit category details
   - Manage category hierarchy
   - Delete categories (with cascade handling)

2. **User Management**
   - View all users
   - Change user roles
   - Ban/unban users
   - Assign moderators to categories

3. **Moderator Assignment**
   - Select users to be moderators
   - Assign moderators to specific categories
   - Manage moderator permissions

### Search Functionality

The application features a sophisticated search system with multiple contexts and real-time suggestions:

1. **Global Search**
   - Access from any page via the top search bar
   - Searches across all content types:
     - Categories and subcategories
     - Thread titles and content
     - Post content
   - Real-time suggestions as you type
   - Results grouped by content type
   - Direct navigation to search results

2. **Context-Aware Search**
   - Category Context:
     - Automatically scopes search to current category
     - Includes subcategories in search scope
     - Shows category-specific suggestions
   - Thread Context:
     - Search within current thread
     - Find specific posts or replies
     - Highlights matched content

3. **Search Features**
   - Smart Suggestions:
     - Shows relevant categories
     - Displays matching thread titles
     - Previews post content
     - Updates in real-time while typing
   - Quick Navigation:
     - Click suggestions to jump directly to content
     - Keyboard navigation through suggestions
     - Clear categorization of results
   - Result Highlighting:
     - Matched terms are highlighted
     - Context snippets shown
     - Relevance-based ordering

4. **Technical Implementation**
   - PostgreSQL full-text search
   - Trigram similarity for fuzzy matching
   - Debounced search requests
   - Optimized query performance
   - Proper indexing for search fields

5. **Using Search**
   - Start typing in search bar
   - Use up/down arrows to navigate suggestions
   - Press Enter to see full results
   - Click suggestions for direct navigation
   - Use filters in results page to refine search

### Content Management

1. **Creating Categories** (Admin only)
   - Access Admin > Categories
   - Fill in category details
   - Optionally select parent category
   - Maximum one level of nesting

2. **Creating Threads**
   - Navigate to desired category
   - Click "New Thread"
   - Enter title and content
   - Submit thread

3. **Posting Replies**
   - Open a thread
   - Use reply form
   - Nested replies up to 3 levels
   - Edit history tracked

### Moderation Tools

1. **Thread Management**
   - Lock/unlock threads
   - Move threads between categories
   - Delete threads if necessary

2. **Content Moderation**
   - Edit inappropriate content
   - Delete violating posts
   - Monitor user behavior

## ❗ Troubleshooting

### Common Setup Issues

1. **Database Connection Errors**
   ```bash
   # Verify PostgreSQL is running
   sudo service postgresql status

   # Reset database if needed
   rails db:drop db:create db:migrate
   ```

2. **Frontend Connection Issues**
   - Verify backend is running on port 3000
   - Check CORS configuration
   - Verify API URL in frontend .env

3. **Authentication Issues**
   ```ruby
   # Rails console
   # Clear user tokens
   User.update_all(reset_password_token: nil)
   ```

4. **Permission Issues**
   ```ruby
   # Rails console
   user = User.find_by(email: 'email@example.com')
   puts "Role: #{user.role}"
   puts "Moderated categories: #{user.moderated_categories.pluck(:name)}"
   ```

### Getting Help

If you encounter issues:
1. Check the Rails server logs
2. Check the browser console
3. Verify environment variables
4. Ensure database configuration is correct

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
