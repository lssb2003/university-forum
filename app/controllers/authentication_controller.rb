class AuthenticationController < ApplicationController
  skip_before_action :authenticate_user, only: [ :login, :register, :forgot_password ]

  def login
    @user = User.find_by_email(params[:email])
    if @user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: @user.id)

      # Include moderated categories in response
      user_data = UserSerializer.new(@user).as_json
      if @user.moderator?
        # Get all categories including subcategories
        direct_categories = @user.moderator_assignments.includes(:category).map(&:category)
        all_categories = direct_categories.flat_map(&:self_and_descendant_ids)
        user_data[:moderated_categories] = all_categories.uniq
      end

      render json: {
        token: token,
        user: user_data
      }, status: :ok
    else
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end



  def register
    @user = User.new(user_params)
    if @user.save
      token = JsonWebToken.encode(user_id: @user.id)
      render json: { token: token, user: @user }, status: :created
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def logout
    render json: { message: "Successfully logged out" }, status: :ok
  end

  def forgot_password
    @user = User.find_by_email(params[:email])
    if @user
      temp_password = generate_temporary_password
      @user.update(password: temp_password)

      # Send email with temporary password
      UserMailer.reset_password_email(@user, temp_password).deliver_now

      render json: { message: "Password reset instructions sent to your email" }, status: :ok
    else
      render json: { error: "Email not found" }, status: :not_found
    end
  end

  def reset_password
    if current_user.authenticate(params[:current_password])
      if current_user.update(password: params[:new_password], password_confirmation: params[:password_confirmation])
        render json: { message: "Password successfully updated" }, status: :ok
      else
        render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "Current password is incorrect" }, status: :unauthorized
    end
  end

  private

  def user_params
    params.permit(:email, :password, :password_confirmation)
  end

  def generate_temporary_password
    SecureRandom.alphanumeric(12)
  end
end
