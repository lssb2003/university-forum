class Admin::CategoriesController < ApplicationController
  before_action :ensure_admin
  before_action :set_category, only: [ :update, :destroy ]

  def create
    @category = Category.new(category_params)

    # Explicitly set parent_category_id to nil if it's an empty string
    @category.parent_category_id = nil if category_params[:parent_category_id].blank?

    if @category.save
      render json: @category, include: [ "moderators", "moderators.user" ]
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    # Convert permitted parameters to hash and check for changes
    original_values = {
      name: @category.name,
      description: @category.description
    }

    new_values = category_params.to_h.slice("name", "description")

    # Check if content has changed (excluding parent_category_id)
    content_changed = original_values.any? do |key, value|
      new_values[key.to_s] != value
    end

    # Only update edited_at, not created_at or updated_at
    @category.edited_at = Time.current if content_changed

    # Disable timestamp updates to preserve ordering
    Category.record_timestamps = false
    begin
      if @category.update(category_params)
        render json: @category, include: [ "moderators", "moderators.user" ]
      else
        render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
      end
    ensure
      Category.record_timestamps = true
    end
  end

  def destroy
    begin
      ActiveRecord::Base.transaction do
        # Remove moderator assignments
        @category.moderator_assignments.destroy_all if @category.moderators.exists?

        # Handle subcategories
        @category.subcategories.update_all(parent_category_id: nil)

        # Handle forum threads
        @category.forum_threads.destroy_all

        # Finally destroy the category
        @category.destroy!

        head :no_content
      end
    rescue => e
      Rails.logger.error("Category deletion failed: #{e.message}")
      render json: { errors: [ "Failed to delete category" ] }, status: :unprocessable_entity
    end
  end

  private

  def ensure_admin
    unless current_user&.admin?
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end

  def set_category
    @category = Category.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Category not found" }, status: :not_found
  end

  def category_params
    params.require(:category).permit(:name, :description, :parent_category_id)
  end
end
