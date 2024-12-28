class CategorySerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :parent_category_id, :edited_at
  has_many :subcategories
  has_many :moderators

  def is_subcategory
    object.subcategory?
  end

  def nesting_level
    object.nesting_level
  end

  def moderators
    object.moderator_assignments.includes(:user).map do |assignment|
      {
        id: assignment.id,
        user_id: assignment.user_id,
        category_id: assignment.category_id,
        user: {
          id: assignment.user.id,
          email: assignment.user.email,
          role: assignment.user.role
        }
      }
    end
  end

  def moderated_categories
    return [] unless object.moderator?
    direct_categories = object.moderator_assignments.includes(:category).map(&:category)
    all_categories = direct_categories.flat_map(&:self_and_descendant_ids)
    all_categories.uniq
  end
end
