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
    @category.edited_at = Time.current if category_params.except(:parent_category_id).any? { |_, v| v != @category[_] }
    if @category.update(category_params)
      render json: @category
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
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
