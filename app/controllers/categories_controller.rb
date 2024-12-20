# app/controllers/categories_controller.rb
class CategoriesController < ApplicationController
  skip_before_action :authenticate_user, only: [ :index, :show ]

  def index
    @categories = Category.includes(:subcategories).where(parent_category_id: nil)
    render json: @categories, include: [ "subcategories" ]
  end

  def show
    @category = Category.find(params[:id])
    render json: @category
  end
end
