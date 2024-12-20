class ModeratorSerializer < ActiveModel::Serializer
  attributes :id, :category_id, :created_at
  belongs_to :user
end
