class CreateForumThreads < ActiveRecord::Migration[7.0]
  def change
    create_table :forum_threads do |t|
      t.string :title, null: false
      t.text :content
      t.references :category, foreign_key: true
      t.references :author, foreign_key: { to_table: :users }
      t.timestamps
    end
  end
end
