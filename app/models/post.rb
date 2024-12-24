# app/models/post.rb
class Post < ApplicationRecord
  include Searchable # for searching
  belongs_to :thread, class_name: "ForumThread"
  belongs_to :author, class_name: "User"
  belongs_to :parent, class_name: "Post", optional: true
  has_many :replies,
            -> { order("created_at ASC") },
            class_name: "Post",
            foreign_key: "parent_id",
            dependent: :destroy

  validates :content, presence: true
  validates :depth, numericality: { less_than_or_equal_to: 3 }

  scope :not_deleted, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :root_posts, -> { where(parent_id: nil).order(created_at: :asc) }

  def soft_delete!
    update_column(:deleted_at, Time.current)
  end

  def deleted?
    deleted_at.present?
  end

  def visible_content
    deleted? ? "[Deleted]" : content
  end

  # Ensure replies don't exceed max depth
  before_save :set_depth
  validate :validate_depth

  after_create :log_depth

  def self.search_suggestions(query)
    not_deleted.search(query)
  end

  def self.search(query)
    not_deleted
      .where("content ILIKE :query", query: "%#{query}%")
      .where(deleted_at: nil)  # Double-check deletion status
  end

  def self.search_suggestions(query)
    not_deleted
      .where("content ILIKE :query", query: "%#{query}%")
      .where(deleted_at: nil)  # Double-check deletion status
      .limit(5)
  end

  private

  def set_depth
    if parent
      self.depth = parent.depth + 1
    else
      self.depth = 0
    end
  end

  def validate_depth
    if depth > 3
      errors.add(:base, "Maximum reply depth exceeded")
    end
  end

  def log_depth
    Rails.logger.debug "Created post #{id} with depth #{depth}"
  end
end
