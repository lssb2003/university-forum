# app/serializers/user_serializer.rb
class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :role, :created_at, :moderated_categories, :banned_at, :ban_reason

  def moderated_categories
    return [] unless object.moderator?
    # Get directly moderated categories and their subcategories
    direct_categories = object.moderator_assignments.includes(:category).map(&:category)
    all_categories = direct_categories.flat_map(&:self_and_descendant_ids)
    all_categories.uniq
  end
end
