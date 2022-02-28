require_relative "boot"
require "active_storage/engine"
require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module FinalProject
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.1
    config.autoload_paths << config.root.join("lib")
    config.autoload_paths << config.root.join("lib/concerns")
    config.autoload_paths << config.root.join("app/services")
    config.autoload_paths << config.root.join("app/serializers")
    # config.time_zone = 'Europe/Paris'
    config.time_zone = "Asia/Ho_Chi_Minh"

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")
  end
end
