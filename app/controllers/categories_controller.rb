# app/controllers/categories_controller.rb
class CategoriesController < ApplicationController
  skip_before_action :authenticate_user, only: [ :index, :show ]

  def index
    @categories = Category.includes(:subcategories)
                        .where(parent_category_id: nil)
                        .order(created_at: :desc)  # Order top-level categories

    # Preload ordered subcategories
    ActiveRecord::Associations::Preloader.new(
      records: @categories,
      associations: [ :subcategories ]
    ).call

    render json: @categories, include: [ "subcategories" ]
  end

  def show
    @category = Category.find(params[:id])
    render json: @category
  end
end
