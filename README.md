# 🎓 University Forum Application

A sophisticated forum platform built with Ruby on Rails API backend and React TypeScript frontend, featuring hierarchical categories, advanced moderation capabilities, and comprehensive role-based access control.

## 📑 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Deployment Guide](#deployment-guide)
- [Authentication System](#authentication-system)
- [User Roles & Permissions](#user-roles--permissions)
- [Core Features](#core-features)
- [API Documentation](#api-documentation)
- [Frontend Architecture](#frontend-architecture)
- [Database Design](#database-design)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🌟 Overview

The University Forum Application is a full-stack web application designed to facilitate structured discussions within an academic context. It implements a sophisticated role-based access control system, hierarchical content organization, and advanced moderation tools.

### Key Highlights
- JWT-based secure authentication
- Hierarchical category management
- Advanced moderation capabilities
- Nested commenting system (up to 3 levels)
- Real-time search functionality
- Responsive React frontend
- RESTful Rails API backend

## 🛠 Technical Architecture

### Backend Stack
- Ruby 3.1.2
- Rails 7.2.2
- PostgreSQL
- JWT Authentication
- ActionMailer with Gmail SMTP

### Frontend Stack
- React 18
- TypeScript
- TanStack Query for state management
- React Router DOM v7
- React Hook Form
- Tailwind CSS
- Axios for API communication

### DevOps
- Nginx as reverse proxy
- Ubuntu Server 22.04 LTS
- AWS EC2 deployment

## 🚀 Features

### Authentication System
- **JWT-based Authentication**
  - Secure token generation and validation
  - Token refresh mechanism
  - Session management
  - Authorization headers handling

- **User Management**
  - Email-based registration
  - Password reset functionality with Gmail SMTP
  - Account recovery system
  - Profile management
  - Ban system with reason tracking

### Role-Based Access Control

#### 🔍 Access Matrix

| Feature                    | Guest | User | Moderator | Admin |
|---------------------------|-------|------|-----------|--------|
| View Content              | ✅    | ✅   | ✅        | ✅     |
| Search                    | ✅    | ✅   | ✅        | ✅     |
| Create Threads            | ❌    | ✅   | ✅        | ✅     |
| Create Posts              | ❌    | ✅   | ✅        | ✅     |
| Edit Own Content          | ❌    | ✅   | ✅        | ✅     |
| Delete Own Content        | ❌    | ✅   | ✅        | ✅     |
| Lock Threads              | ❌    | ❌   | ✅*       | ✅     |
| Move Threads              | ❌    | ❌   | ✅*       | ✅     |
| Moderate Content          | ❌    | ❌   | ✅*       | ✅     |
| Manage Categories         | ❌    | ❌   | ❌        | ✅     |
| Manage Users             | ❌    | ❌   | ❌        | ✅     |
| Assign Moderators        | ❌    | ❌   | ❌        | ✅     |

*Within assigned categories only

### Content Management

#### Categories & Subcategories
- Hierarchical structure (max 1 level deep)
- Category-specific moderation
- Organized content grouping
- Chronological ordering
- Proper cascade handling for deletions

#### Thread Management
- Thread creation and editing
- Locking/unlocking capability
- Category transfer functionality
- Edit history tracking
- Content moderation tools

#### Post System
- Nested replies up to 3 levels
- Soft delete implementation
- Edit timestamp tracking
- Proper ordering maintenance
- Parent-child relationship management

### Search Functionality
- Real-time search suggestions
- Multi-context search (categories, threads, posts)
- Advanced PostgreSQL text search
- Context-aware results
- Performance-optimized queries

### Admin Dashboard
- **User Management**
  - Role assignment
  - Ban management
  - Activity monitoring
  - Permission control

- **Category Management**
  - Create/Edit/Delete categories
  - Subcategory organization
  - Moderator assignment
  - Content oversight

- **Moderation Tools**
  - Content moderation queue
  - User reports handling
  - Lock/Unlock threads
  - Move thread between categories

## 📋 Setup & Installation

### Prerequisites
- Ruby 3.1.2 (managed with rbenv)
- Rails 7.2.2
- PostgreSQL 12+
- Node.js 18+
- npm/yarn
- Gmail account for mailer
- Git

### Development Environment Setup

#### 1. Backend Setup

```bash
# Clone repository
git clone [your-repository-url]
cd university-forum-api

# Install Ruby dependencies
bundle install

# Database setup
rails db:create
rails db:migrate

# Create environment file
cat > .env << EOL
GMAIL_USERNAME=your_email@gmail.com
GMAIL_PASSWORD=your_app_specific_password
EOL

# Start Rails server
rails s
```

#### 2. Frontend Setup

```bash
cd university-forum-client

# Install dependencies
npm install

# Environment setup
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# Start development server
npm start
```

#### 3. Admin Setup

Choose one of the following methods to create your first admin user:

Method 1: Create New Admin User
```bash
# Start Rails console
rails console

# Create admin user
admin = User.new(
  email: 'admin@example.com',
  password: 'your_secure_password',
  password_confirmation: 'your_secure_password',
  role: 'admin'
)
admin.save!
```

Method 2: Upgrade Existing User
```bash
# Start Rails console
rails console

# Find and upgrade user
user = User.find_by(email: 'your@email.com')
user.update!(role: 'admin')
```

## 🌐 Deployment Guide

### AWS EC2 Setup

#### 1. Instance Configuration
- Launch Ubuntu Server 22.04 LTS
- Instance type: t2.small (minimum)
- Configure Security Group:
  ```
  SSH (22)          - Your IP
  HTTP (80)         - Anywhere
  HTTPS (443)       - Anywhere
  Custom TCP (3000) - Anywhere
  ```

#### 2. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y postgresql postgresql-contrib nginx git curl libssl-dev \
    libreadline-dev zlib1g-dev autoconf bison build-essential libyaml-dev \
    libreadline-dev libncurses5-dev libffi-dev libgdbm-dev libpq-dev

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Ruby
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
rbenv install 3.1.2
rbenv global 3.1.2
```

#### 3. PostgreSQL Configuration
```bash
sudo -u postgres psql -c "CREATE USER forum_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "CREATE DATABASE university_forum_production OWNER forum_user;"
```

#### 4. Application Deployment
```bash
# Setup application directory
sudo mkdir -p /var/www/university-forum
sudo chown ubuntu:ubuntu /var/www/university-forum
cd /var/www/university-forum

# Clone repository
git clone [your-repository-url] .

# Backend setup
bundle install
RAILS_ENV=production rails db:migrate
RAILS_ENV=production rails assets:precompile

# Frontend setup
cd university-forum-client
npm install
npm run build
```

#### 5. Nginx Configuration
```nginx
server {
    listen 80;
    server_name _;

    root /var/www/university-forum/university-forum-client/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
    }
}
```

Enable configuration:
```bash
sudo ln -s /etc/nginx/sites-available/university-forum /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Environment Setup
```bash
cd /var/www/university-forum

# Create production environment file
cat > .env.production << EOL
RAILS_ENV=production
RAILS_MASTER_KEY=your_master_key
GMAIL_USERNAME=your_gmail@gmail.com
GMAIL_PASSWORD=your_gmail_app_password
DATABASE_URL=postgres://forum_user:your_secure_password@localhost/university_forum_production
EOL
```

#### 7. Start Application
```bash
# Start Rails server
RAILS_ENV=production rails s -d
```

## 📊 Database Structure

### Core Tables

#### Users
```ruby
create_table "users" do |t|
  t.string   "email", null: false
  t.string   "password_digest"
  t.integer  "role", default: 0
  t.datetime "banned_at"
  t.text     "ban_reason"
  t.timestamps
end
```

#### Categories
```ruby
create_table "categories" do |t|
  t.string   "name", null: false
  t.text     "description"
  t.bigint   "parent_category_id"
  t.datetime "edited_at"
  t.timestamps
end
```

#### Forum Threads
```ruby
create_table "forum_threads" do |t|
  t.string   "title", null: false
  t.text     "content"
  t.bigint   "category_id"
  t.bigint   "author_id"
  t.boolean  "is_locked", default: false
  t.datetime "edited_at"
  t.timestamps
end
```

#### Posts
```ruby
create_table "posts" do |t|
  t.text     "content", null: false
  t.bigint   "thread_id"
  t.bigint   "author_id"
  t.datetime "deleted_at"
  t.bigint   "parent_id"
  t.integer  "depth", default: 0
  t.datetime "edited_at"
  t.timestamps
end
```

#### Moderators
```ruby
create_table "moderators" do |t|
  t.bigint   "category_id"
  t.bigint   "user_id"
  t.timestamps
end
```

## 🔧 Troubleshooting

### Common Development Issues

#### Database Connection
```bash
# Check PostgreSQL status
sudo service postgresql status

# Reset database
rails db:drop db:create db:migrate
```

#### JWT Authentication
```ruby
# Rails console
# Reset user tokens
User.update_all(reset_password_token: nil)
```

#### React Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules
npm install
```

### Production Issues

#### Rails Server
```bash
# Check Rails processes
ps aux | grep rails

# View Rails logs
tail -f log/production.log
```

#### Nginx
```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

#### Database
```bash
# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow Ruby style guide
- Use TypeScript for frontend
- Write clean, documented code
- Include tests for new features
- Update documentation as needed

### Pull Request Process
1. Update the README.md with details of changes if needed
2. Update any relevant documentation
3. Add tests for new functionality
4. Ensure the test suite passes
5. Get approval from maintainers

## 📝 Project Structure

### Backend Structure
```
university-forum-api/
├── app/
│   ├── controllers/
│   │   ├── admin/
│   │   │   ├── categories_controller.rb
│   │   │   ├── moderators_controller.rb
│   │   │   └── users_controller.rb
│   │   ├── authentication_controller.rb
│   │   ├── categories_controller.rb
│   │   ├── posts_controller.rb
│   │   └── threads_controller.rb
│   ├── models/
│   ├── services/
│   └── serializers/
├── config/
└── spec/
```

### Frontend Structure
```
university-forum-client/
├── src/
│   ├── api/
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── posts/
│   │   └── threads/
│   ├── contexts/
│   ├── hooks/
│   ├── types/
│   └── utils/
└── package.json
```
