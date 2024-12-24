class ForumThread < ApplicationRecord
  include Searchable # for searching
  belongs_to :category
  belongs_to :author, class_name: "User"
  has_many :posts, foreign_key: "thread_id", dependent: :destroy  # Add dependent: :destroy

  validates :title, presence: true
  validates :content, presence: true

  before_update :set_edited_at, if: :content_changed_after_create?

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

  def self.search(query)
    where("title ILIKE :query OR content ILIKE :query", query: "%#{query}%")
  end

  def self.search_suggestions(query)
    search(query).limit(5)
  end

  private

  def content_changed_after_create?
    !new_record? && (title_changed? || content_changed?)
  end

  def set_edited_at
    self.edited_at = Time.current
  end

  def update_timestamps_on_edit
    if title_changed? || content_changed?
      self.edited_at = Time.current
      self.updated_at = Time.current
    end
  end
end
