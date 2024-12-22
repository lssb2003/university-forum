class AddBanFieldsToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :banned_at, :datetime
    add_column :users, :ban_reason, :text
  end
end
