# app/serializers/post_serializer.rb
class PostSerializer < ActiveModel::Serializer
  attributes :id, :content, :created_at, :deleted_at, :depth, :visible_content, :author_id, :can_moderate, :edited_at
  belongs_to :author, serializer: UserSerializer
  belongs_to :thread
  belongs_to :parent, serializer: PostSerializer, optional: true
  has_many :replies, serializer: PostSerializer

  def can_moderate
    user = scope # current user
    return false unless user
    return true if user.admin?
    if user.moderator?
      # Get all moderated categories including subcategories
      direct_categories = user.moderator_assignments.includes(:category).map(&:category)
      all_categories = direct_categories.flat_map(&:self_and_descendant_ids)
      return all_categories.include?(object.thread.category_id)
    end
    false
  end

  def visible_content
    object.visible_content
  end
end
