require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false

  config.eager_load = true

  config.consider_all_requests_local = false

  config.active_storage.service = :local


  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = false


  # Log to STDOUT by default
  config.logger = ActiveSupport::Logger.new(STDOUT)
    .tap  { |logger| logger.formatter = ::Logger::Formatter.new }
    .then { |logger| ActiveSupport::TaggedLogging.new(logger) }

  config.log_tags = [ :request_id ]

  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  config.action_mailer.perform_caching = false

  config.i18n.fallbacks = true

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  # Only use :id for inspections in production.
  config.active_record.attributes_for_inspect = [ :id ]

  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address:              "smtp.gmail.com",
    port:                 587,
    domain:               "example.com",
    user_name:           ENV["GMAIL_USERNAME"],
    password:            ENV["GMAIL_PASSWORD"],
    authentication:      "plain",
    enable_starttls_auto: true,
    open_timeout:        5,
    read_timeout:        5
  }

  config.action_mailer.default_url_options = { host: "YOUR_EC2_IP", protocol: "http" }


  config.hosts << "YOUR_EC2_IP"
  config.hosts << "localhost"
  config.action_controller.allow_forgery_protection = false
end
