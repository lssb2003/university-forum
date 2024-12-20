class Admin::ModeratorsController < ApplicationController
  before_action :ensure_admin

  def create
    @moderator = Moderator.new(moderator_params)

    # Wrap in transaction to ensure data consistency
    Moderator.transaction do
      if @moderator.save
        render json: @moderator
      else
        render json: { errors: @moderator.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end


  def destroy
    @moderator = Moderator.find(params[:id])
    @moderator.destroy
    head :no_content
  end

  private

  def ensure_admin
    unless current_user&.admin?
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end

  def moderator_params
    params.require(:moderator).permit(:user_id, :category_id)
  end
end
