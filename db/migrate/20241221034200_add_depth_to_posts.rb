class AddDepthToPosts < ActiveRecord::Migration[7.2]
  def change
    # Only add the column if it doesn't exist
    unless column_exists?(:posts, :depth)
      add_column :posts, :depth, :integer, default: 0, null: false
      add_index :posts, :depth
    end

    # Update existing posts
    reversible do |dir|
      dir.up do
        execute <<-SQL
          WITH RECURSIVE post_depths AS (
            -- Base case: root posts (no parent)
            SELECT id, 0 as depth
            FROM posts
            WHERE parent_id IS NULL
          #{'  '}
            UNION ALL
          #{'  '}
            -- Recursive case: posts with parents
            SELECT p.id, pd.depth + 1
            FROM posts p
            INNER JOIN post_depths pd ON p.parent_id = pd.id
          )
          UPDATE posts
          SET depth = post_depths.depth
          FROM post_depths
          WHERE posts.id = post_depths.id
        SQL
      end
    end
  end

  def down
    remove_index :posts, :depth if index_exists?(:posts, :depth)
    remove_column :posts, :depth if column_exists?(:posts, :depth)
  end
end
