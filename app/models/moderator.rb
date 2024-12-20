# app/models/moderator.rb
class Moderator < ApplicationRecord
  belongs_to :user
  belongs_to :category

  validates :user_id, presence: true
  validates :category_id, presence: true
  validates :user_id, uniqueness: {
    scope: :category_id,
    message: "is already a moderator for this category"
  }

  after_create :update_user_role

  private

  def update_user_role
    user.update(role: :moderator) if user.user?
  end
end
