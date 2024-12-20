class CreatePosts < ActiveRecord::Migration[7.0]
  def change
    create_table :posts do |t|
      t.text :content, null: false
      t.references :thread, foreign_key: { to_table: :forum_threads }
      t.references :author, foreign_key: { to_table: :users }
      t.timestamps
    end
  end
end
