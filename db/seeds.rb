# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
# Create admin user
admin = User.create!(
  email: 'admin@example.com',
  password: 'password123',
  role: 'admin'
)

# Create categories
academics = Category.create!(
  name: 'Academics',
  description: 'Academic discussions and resources'
)

campus_life = Category.create!(
  name: 'Campus Life',
  description: 'Everything about campus living'
)

# Create subcategories
course_help = Category.create!(
  name: 'Course Help',
  description: 'Get help with your courses',
  parent_category: academics
)

events = Category.create!(
  name: 'Events',
  description: 'Campus events and activities',
  parent_category: campus_life
)

# Create some threads
thread1 = ForumThread.create!(
  title: 'Welcome to the Forum',
  content: 'Welcome everyone! Feel free to introduce yourself.',
  category: campus_life,
  author: admin
)

thread2 = ForumThread.create!(
  title: 'Study Tips for Finals',
  content: 'Share your best study tips here!',
  category: academics,
  author: admin
)
