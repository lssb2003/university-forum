class Admin::UsersController < ApplicationController
  before_action :ensure_admin
  before_action :set_user, only: [ :update_role, :ban, :unban ]

  def index
    @users = User.all
    render json: @users
  end

  def update_role
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

  def ban
    if @user.update(banned_at: Time.current, ban_reason: params[:reason])
      render json: @user
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def unban
    if @user.update(banned_at: nil, ban_reason: nil)
      render json: @user
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def ensure_admin
    unless current_user&.admin?
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end
end
