# frozen_string_literal: true

class SessionsController < ApplicationController
  skip_before_action :sign_in, if: -> { current_user.nil? }
  skip_before_action :redirect_to_users, only: %i[destroy]

  def new; end

  # login
  def create
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      if user.activated
        log_in user
        user.generate_token
        set_api_token(user)
        params[:remember_me] == 'on' ? remember(user) : forget(user)
        redirect_to users_path
      else
        message = 'Account not activated. Check your email for the activation link.'
        flash[:warning] = message
        redirect_to login_path
      end
    else
      message = 'Account not invalid.'
      flash[:danger] = message
      redirect_to login_path
    end
  end

  def destroy
    log_out
    redirect_to login_path
  end
end
