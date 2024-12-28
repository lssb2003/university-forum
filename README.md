# University Forum Application

A comprehensive university forum system built with Ruby on Rails API backend and React TypeScript frontend, featuring hierarchical categories, advanced moderation tools, and sophisticated role-based access control.

## 📑 Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [User Roles & Permissions](#user-roles--permissions)
- [Core Features Guide](#core-features-guide)
- [Troubleshooting](#troubleshooting)

## 🚀 Features

### Authentication System
- Email-based user registration
- JWT token authentication
- Password reset functionality with email notifications
- Session management and persistence
- Secure password handling with BCrypt

### Category System
- Hierarchical structure with main categories and subcategories
- One-level depth limitation for subcategories
- Chronological ordering of categories and threads
- Category-specific moderation capabilities
- Cascade handling for category deletions

### Thread Management
- Create and edit threads within categories
- Thread locking/unlocking functionality
- Move threads between categories (moderator feature)
- Chronological and updated-time ordering
- Edit history tracking

### Post System
- Threaded discussions with nested replies
- Maximum 3-level deep nested replies
- Edit history tracking for all posts
- Soft delete functionality
- Chronological ordering within threads
- Rich text content support

### Search System
- Global search across all content types
- Context-aware search within categories
- Real-time search suggestions
- Fuzzy matching capabilities
- Results grouped by content type
- Search within specific categories or threads

### Moderation System
- Comprehensive ban system with reason tracking
- Thread locking and movement
- Content moderation tools
- Category-specific moderator assignments
- Moderator action tracking

### User Management
- Role-based access control (Guest, User, Moderator, Admin)
- User profile management
- Password reset capability
- Ban/unban functionality
- Email notifications
- Edit history tracking

## 🛠 Technology Stack

### Backend
- Ruby 3.1.2
- Rails 7.2.2
- PostgreSQL database
- JWT authentication
- ActionMailer for emails

### Frontend
- React 18
- TypeScript
- TanStack Query
- React Router Dom
- React Hook Form
- Tailwind CSS
- Axios for API calls

## 📁 Project Structure

\`\`\`
forum-app/
├── app/
│   ├── controllers/
│   │   ├── admin/             # Admin controllers
│   │   │   ├── categories_controller.rb
│   │   │   ├── moderators_controller.rb
│   │   │   └── users_controller.rb
│   │   ├── authentication_controller.rb
│   │   ├── categories_controller.rb
│   │   ├── posts_controller.rb
│   │   ├── search_controller.rb
│   │   └── threads_controller.rb
│   ├── models/
│   │   ├── category.rb
│   │   ├── forum_thread.rb
│   │   ├── moderator.rb
│   │   ├── post.rb
│   │   └── user.rb
│   └── serializers/
├── config/
│   ├── routes.rb
│   └── database.yml
└── university-forum-client/    
    ├── src/
    │   ├── api/               # API integration
    │   ├── components/        # React components
    │   │   ├── admin/        # Admin dashboard
    │   │   ├── auth/         # Authentication
    │   │   ├── categories/   # Category management
    │   │   ├── posts/        # Post components
    │   │   ├── threads/      # Thread components
    │   │   └── ui/           # Reusable UI
    │   ├── contexts/         # React contexts
    │   └── types/            # TypeScript types
    └── package.json
\`\`\`

## 📋 Prerequisites

- Ruby 3.1.2
- Rails 7.2.2
- PostgreSQL 12+
- Node.js 16+ and npm
- Git
- Gmail account (for email functionality)

## 🔧 Setup Instructions

### Backend Setup

1. Clone the repository:
\`\`\`bash
git clone [your-repository-url]
cd forum-app
\`\`\`

2. Install Ruby dependencies:
\`\`\`bash
bundle install
\`\`\`

3. Configure your database:
Update config/database.yml:
\`\`\`yaml
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
\`\`\`

4. Setup environment variables:
Create .env in the root directory:
\`\`\`bash
GMAIL_USERNAME=your_email@gmail.com
GMAIL_PASSWORD=your_app_specific_password
\`\`\`

5. Initialize database:
\`\`\`bash
rails db:create
rails db:migrate
\`\`\`

6. Start Rails server:
\`\`\`bash
rails s
\`\`\`

### Frontend Setup

1. Navigate to frontend directory:
\`\`\`bash
cd university-forum-client
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure environment:
Create .env file:
\`\`\`bash
REACT_APP_API_URL=http://localhost:3000
\`\`\`

4. Start development server:
\`\`\`bash
npm start
\`\`\`

### First Admin User Setup

1. Start Rails console:
\`\`\`bash
rails console
\`\`\`

2. Create admin user:
\`\`\`ruby
admin = User.new(
  email: 'admin@example.com',
  password: 'secure_password',
  password_confirmation: 'secure_password',
  role: 'admin'
)
admin.save!
\`\`\`

## 👥 User Roles & Permissions

### Guest
- View categories, threads, and posts
- Use search functionality
- Cannot create or interact with content

### Registered User
- Create new threads
- Post replies (up to 3 levels deep)
- Edit/delete own content
- Access profile settings
- Reset password
- Cannot create content if banned

### Moderator
- All registered user privileges
- Lock/unlock threads in moderated categories
- Move threads between moderated categories
- Edit/delete content in moderated categories
- Manage subcategories under moderated categories
- Loses privileges if banned

### Administrator
- Full system access
- Manage all categories and subcategories
- Control user roles and permissions
- Ban/unban users
- Assign/remove moderators
- Access admin dashboard
- Not affected by bans

## ❗ Troubleshooting

### Common Issues

#### Database Connection
\`\`\`bash
# Check PostgreSQL status
sudo service postgresql status

# Reset database
rails db:drop db:create db:migrate
\`\`\`

#### Authentication Issues
\`\`\`ruby
# In Rails console
# Clear tokens
User.update_all(reset_password_token: nil)
\`\`\`

#### Permission Issues
\`\`\`ruby
# In Rails console
user = User.find_by(email: 'email@example.com')
puts "Role: #{user.role}"
puts "Moderated categories: #{user.moderated_categories.pluck(:name)}"
\`\`\`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
