# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_12_23_074751) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_trgm"
  enable_extension "plpgsql"

  create_table "categories", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.bigint "parent_category_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "edited_at"
    t.index ["parent_category_id"], name: "index_categories_on_parent_category_id"
  end

  create_table "forum_threads", force: :cascade do |t|
    t.string "title", null: false
    t.text "content"
    t.bigint "category_id"
    t.bigint "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_locked", default: false
    t.datetime "edited_at"
    t.index ["author_id"], name: "index_forum_threads_on_author_id"
    t.index ["category_id"], name: "index_forum_threads_on_category_id"
  end

  create_table "moderators", force: :cascade do |t|
    t.bigint "category_id"
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_moderators_on_category_id"
    t.index ["user_id", "category_id"], name: "index_moderators_on_user_id_and_category_id", unique: true
    t.index ["user_id"], name: "index_moderators_on_user_id"
  end

  create_table "posts", force: :cascade do |t|
    t.text "content", null: false
    t.bigint "thread_id"
    t.bigint "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at"
    t.bigint "parent_id"
    t.integer "depth", default: 0
    t.datetime "edited_at"
    t.index ["author_id"], name: "index_posts_on_author_id"
    t.index ["parent_id"], name: "index_posts_on_parent_id"
    t.index ["thread_id", "parent_id", "created_at"], name: "index_posts_on_thread_parent_created"
    t.index ["thread_id"], name: "index_posts_on_thread_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest"
    t.integer "role", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "banned_at"
    t.text "ban_reason"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "categories", "categories", column: "parent_category_id"
  add_foreign_key "forum_threads", "categories"
  add_foreign_key "forum_threads", "users", column: "author_id"
  add_foreign_key "moderators", "categories"
  add_foreign_key "moderators", "users"
  add_foreign_key "posts", "forum_threads", column: "thread_id"
  add_foreign_key "posts", "posts", column: "parent_id"
  add_foreign_key "posts", "users", column: "author_id"
end
