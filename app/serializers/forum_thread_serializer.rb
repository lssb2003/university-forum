# app/serializers/forum_thread_serializer.rb
class ForumThreadSerializer < ActiveModel::Serializer
  attributes :id, :title, :content, :created_at, :category_id, :is_locked, :author_id, :can_moderate

  belongs_to :author
  belongs_to :category

  def can_moderate
    user = scope
    return false unless user
    return true if user.admin?
    if user.moderator?
      direct_categories = user.moderator_assignments.includes(:category).map(&:category)
      all_categories = direct_categories.flat_map(&:self_and_descendant_ids)
      return all_categories.include?(object.category_id)
    end
    false
  end
end
