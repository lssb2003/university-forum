class UserMailer < ApplicationMailer
  default from: ENV["GMAIL_USERNAME"]

  def reset_password_email(user, temp_password)
    @user = user
    @temp_password = temp_password
    mail(to: @user.email, subject: "Your Temporary Password")
  end
end
