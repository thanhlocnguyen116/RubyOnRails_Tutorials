# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include SessionsHelper
  before_action :sign_in, :redirect_to_users
end
