class AddOrderingIndexesToPosts < ActiveRecord::Migration[7.2]
  def change
    add_index :posts, [ :thread_id, :parent_id, :created_at ],
              name: 'index_posts_on_thread_parent_created'
  end
end
