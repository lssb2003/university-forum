# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  before_action :authenticate_user

  def authenticate_user
    header = request.headers["Authorization"]
    header = header.split(" ").last if header

    if header
      begin
        @decoded = JsonWebToken.decode(header)
        @current_user = User.find(@decoded[:user_id])
      rescue ActiveRecord::RecordNotFound => e
        render json: { errors: e.message }, status: :unauthorized
      rescue JWT::DecodeError => e
        render json: { errors: e.message }, status: :unauthorized
      end
    end
  end

  def current_user
    @current_user
  end

  def require_login
    unless current_user
      render json: { error: "You need to be logged in" }, status: :unauthorized
    end
  end
end
