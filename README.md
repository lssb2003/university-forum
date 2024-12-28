# University Forum Application 🎓

A comprehensive university forum system featuring hierarchical categories, advanced moderation capabilities, and sophisticated role-based access control. Built with Ruby on Rails API backend and React TypeScript frontend.

## 📑 Table of Contents
- [Features](#features)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Authentication System](#authentication-system)
- [User Roles & Permissions](#user-roles--permissions)
- [Core Functionalities](#core-functionalities)
- [Search System](#search-system)
- [Admin Features](#admin-features)
- [Moderation Tools](#moderation-tools)
- [Database Structure](#database-structure)
- [Troubleshooting](#troubleshooting)

## 🚀 Features

### Authentication System
- JWT-based authentication
- Email-based registration
- Password reset functionality
- Session management
- Ban system with reason tracking

### Role-Based Access Control
#### 👤 Guest Users
- View all categories and subcategories
- Browse threads and posts
- Access search functionality
- View user profiles

#### 👨‍💼 Registered Users
- Create new threads
- Post replies (up to 3 levels deep)
- Edit own content
- Delete own content
- Access profile management
- Reset password functionality
- Content creation restricted if banned

#### 👨‍✈️ Moderators
- Lock/unlock threads in moderated categories
- Move threads between moderated categories
- Edit content in moderated categories
- Delete content in moderated categories
- Manage subcategories
- Access moderation tools
- Privileges revoked if banned

#### 👨‍⚖️ Administrators
- Full system access
- Manage all categories/subcategories
- Control user roles
- Ban/unban users
- Assign moderators
- Access admin dashboard
- Immune to ban restrictions

## 🛠 Technical Stack

### Backend
- Ruby on Rails 7.2.2
- PostgreSQL database
- JWT authentication
- ActionMailer for emails
- Advanced query optimization
- Permission caching system

### Frontend
- React 18
- TypeScript
- TanStack Query
- React Router DOM
- React Hook Form
- Tailwind CSS
- Responsive design

## 📁 Project Structure
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
│   │   ├── threads_controller.rb
│   │   └── search_controller.rb
│   ├── models/
│   │   ├── category.rb
│   │   ├── forum_thread.rb
│   │   ├── moderator.rb
│   │   ├── post.rb
│   │   └── user.rb
│   └── serializers/
├── config/
└── university-forum-client/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   │   ├── admin/
    │   │   ├── auth/
    │   │   ├── posts/
    │   │   ├── threads/
    │   │   └── ui/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── types/
    │   └── utils/
    └── package.json
```

## 📋 Prerequisites
- Ruby 3.1.2
- Rails 7.2.2
- PostgreSQL 12+
- Node.js 18+
- npm/yarn
- Gmail account (for mailer functionality)

## 🔧 Setup Instructions

### Backend Setup

1. Clone the repository:
```bash
git clone <your-repository-url>
cd university-forum-api
```

2. Install Ruby dependencies:
```bash
bundle install
```

3. Configure database:
```bash
# Update config/database.yml with your PostgreSQL credentials
rails db:create
rails db:migrate
```

4. Set up environment variables:
```bash
# Create .env file
touch .env

# Add required variables
GMAIL_USERNAME=your_email@gmail.com
GMAIL_PASSWORD=your_app_specific_password
```

5. Start the Rails server:
```bash
rails s
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd university-forum-client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Create .env file
echo "REACT_APP_API_URL=http://localhost:3000" > .env
```

4. Start development server:
```bash
npm start
```

### Initial Admin Setup

1. Start Rails console:
```bash
rails console
```

2. Create admin user:
```ruby
admin = User.new(
  email: 'admin@example.com',
  password: 'secure_password',
  password_confirmation: 'secure_password',
  role: 'admin'
)
admin.save!
```

## 🎯 Core Functionalities

### Category System
- Hierarchical structure
- One level of subcategories
- Category-specific moderation
- Chronological ordering
- Cascade handling for deletions

### Thread Management
- Create/edit threads
- Thread locking
- Move threads between categories
- Chronological ordering
- Ban status enforcement

### Post System
- Nested replies (up to 3 levels)
- Edit history tracking
- Soft delete functionality
- Chronological ordering
- Content moderation

### Search Features
- Global search across all content
- Context-aware suggestions
- Real-time results
- Category-specific search
- Post content search
- Thread title search
- PostgreSQL full-text search optimization

## 🔍 Search System
- Real-time suggestions
- Context-aware results
- Multiple content type support
- Efficient query optimization
- Proper PostgreSQL indexing

## ⚙️ Admin Features
- Complete user management
- Role assignment
- Ban system management
- Category creation/editing
- Moderator assignment
- System monitoring

## 🛡️ Moderation Tools
- Content moderation
- Thread management
- User management
- Category moderation
- Ban implementation

## 📊 Database Structure

### Key Tables
- users
- categories
- forum_threads
- posts
- moderators

### Important Relations
- Category hierarchies
- Thread categorization
- Post threading
- Moderator assignments
- User roles

## ❗ Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
sudo service postgresql status

# Reset database
rails db:drop db:create db:migrate
```

#### Authentication Issues
```ruby
# Rails console
User.update_all(reset_password_token: nil)
```

#### Permission Problems
```ruby
# Rails console
user = User.find_by(email: 'email@example.com')
puts "Role: #{user.role}"
puts "Moderated categories: #{user.moderated_categories.pluck(:name)}"
```

### Getting Help
- Check Rails server logs
- Verify environment variables
- Check database configuration
- Monitor browser console
- Check network requests
