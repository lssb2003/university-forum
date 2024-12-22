class Admin::UsersController < ApplicationController
  before_action :ensure_admin
  before_action :set_user, only: [ :update_role, :ban, :unban ]

  def index
    @users = User.order(created_at: :desc)
    render json: @users
  end

  def update_role
    User.transaction do
      # Disable timestamps to preserve order
      User.record_timestamps = false
      begin
        # If changing from moderator to another role, remove all moderator assignments
        if @user.moderator? && params[:role] != "moderator"
          @user.moderator_assignments.destroy_all
        end

        if @user.update(role: params[:role])
          render json: @user
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      ensure
        User.record_timestamps = true
      end
    end
  end

  def ban
    User.transaction do
      User.record_timestamps = false
      begin
        if @user.update(banned_at: Time.current, ban_reason: params[:reason])
          render json: @user
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      ensure
        User.record_timestamps = true
      end
    end
  end

  def unban
    User.transaction do
      User.record_timestamps = false
      begin
        if @user.update(banned_at: nil, ban_reason: nil)
          render json: @user
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      ensure
        User.record_timestamps = true
      end
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
