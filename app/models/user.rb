class User < ApplicationRecord
  has_secure_password
  has_many :moderator_assignments, class_name: "Moderator", dependent: :destroy
  has_many :moderated_categories, through: :moderator_assignments, source: :category

  # Existing code - keep as is
  enum :role, { user: 0, moderator: 1, admin: 2 }
  has_many :forum_threads, foreign_key: "author_id"
  has_many :posts, foreign_key: "author_id"

  validates :email, presence: true, uniqueness: true
  validates :password, length: { minimum: 6 }, if: -> { new_record? || password.present? }

  # Existing methods - keep as is
  def password_reset_valid?
    (reset_password_sent_at + 1.hour) > Time.current if reset_password_sent_at
  end

  def can_moderate?(category_id)
    return true if admin?
    return false unless moderator?

    # Check if category is a subcategory of any moderated category
    moderated_category_ids.include?(category_id)
  end

  def can_lock_thread?(thread)
    return true if admin?
    return false unless moderator?
    moderated_categories.pluck(:id).include?(thread.category_id)
  end

  def moderated_category_ids
    return @moderated_category_ids if @moderated_category_ids

    # Get directly moderated categories and their subcategories
    direct_categories = moderator_assignments.includes(:category).map(&:category)
    all_categories = direct_categories.flat_map(&:self_and_descendant_ids)

    @moderated_category_ids = all_categories.uniq
  end

  def banned?
    banned_at.present?
  end

  def can_create_content?
    !banned?
  end

  def ban!(reason:)
    update!(
      banned_at: Time.current,
      ban_reason: reason
    )
  end

  def unban!
    update!(
      banned_at: nil,
      ban_reason: nil
    )
  end

  # Method to check if user can post
  def can_post?
    !banned? && (role == "user" || role == "moderator" || role == "admin")
  end
end
