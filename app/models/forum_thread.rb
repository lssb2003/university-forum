# app/models/forum_thread.rb
class ForumThread < ApplicationRecord
  include Searchable # for searching
  belongs_to :category
  belongs_to :author, class_name: "User"
  has_many :posts, foreign_key: "thread_id", dependent: :destroy  # Add dependent: :destroy

  validates :title, presence: true
  validates :content, presence: true

  def lock!
    puts "Calling lock! method"
    update!(is_locked: true)  # Use update! to raise errors if it fails
  end


  def unlock!
    puts "Calling unlock! method"
    update!(is_locked: false)
  end


  def change
    add_column :forum_threads, :is_locked, :boolean, default: false
  end
end
