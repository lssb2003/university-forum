class AddIsLockedToThreads < ActiveRecord::Migration[7.2]
  def change
    add_column :forum_threads, :is_locked, :boolean, default: false
  end
end
