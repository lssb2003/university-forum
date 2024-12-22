class AddEditedAtToContent < ActiveRecord::Migration[7.2]
  def change
    add_column :categories, :edited_at, :datetime
    add_column :forum_threads, :edited_at, :datetime
    add_column :posts, :edited_at, :datetime
  end
end
