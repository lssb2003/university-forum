class Admin::UsersController < ApplicationController
  before_action :ensure_admin

  def index
    @users = User.all
    render json: @users
  end

  def update_role
    @user = User.find(params[:id])

    User.transaction do
      # If changing from moderator to another role, remove all moderator assignments
      if @user.moderator? && params[:role] != "moderator"
        @user.moderator_assignments.destroy_all
      end

      if @user.update(role: params[:role])
        render json: @user
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end


  private

  def ensure_admin
    unless current_user&.admin?
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end
end
