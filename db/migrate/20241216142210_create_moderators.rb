class CreateModerators < ActiveRecord::Migration[7.2]
  def change
    create_table :moderators do |t|
      t.references :category, foreign_key: true
      t.references :user, foreign_key: true
      t.timestamps
    end

    # Ensure a user can only moderate a category once
    add_index :moderators, [ :user_id, :category_id ], unique: true
  end
end
