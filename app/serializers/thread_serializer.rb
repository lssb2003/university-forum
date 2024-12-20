class ThreadSerializer < ActiveModel::Serializer
  attributes :id, :title, :content, :created_at, :category_id, :is_locked
  belongs_to :author, serializer: UserSerializer
  has_many :posts

  belongs_to :category

  # Add this to help with permission checks
  attribute :can_moderate do
    current_user = scope
    return false unless current_user
    current_user.can_moderate?(object.category_id)
  end
end
