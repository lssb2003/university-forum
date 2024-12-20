class UsersController < ApplicationController
  before_action :authenticate_user, except: [ :create ]

  def create
    user = User.new(user_params)
    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user: UserSerializer.new(user)
      }, status: :created
    else
      render json: { errors: user.errors }, status: :unprocessable_entity
    end
  end

  def moderated_categories
    @user = User.find(params[:id])
    @categories = @user.moderated_categories
    Rails.logger.debug "Moderated Categories: #{@categories.inspect}" # Add debug logging
    render json: @categories.pluck(:id)
  end

  private

  def user_params
    params.permit(:email, :password, :password_confirmation)
  end
end
