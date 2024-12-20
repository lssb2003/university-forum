class AddSoftDeleteAndReplyToPosts < ActiveRecord::Migration[7.2]
  def change
    add_column :posts, :deleted_at, :datetime
    add_column :posts, :parent_id, :bigint
    add_column :posts, :depth, :integer, default: 0
    add_foreign_key :posts, :posts, column: :parent_id
    add_index :posts, :parent_id
  end
end
