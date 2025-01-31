# frozen_string_literal: true

module Gitlab
  module Pages
    VERSION = File.read(Rails.root.join("GITLAB_PAGES_VERSION")).strip.freeze
    INTERNAL_API_REQUEST_HEADER = 'Gitlab-Pages-Api-Request'
    MAX_SIZE = 1.terabyte

    include JwtAuthenticatable

    class << self
      def verify_api_request(request_headers)
        decode_jwt(request_headers[INTERNAL_API_REQUEST_HEADER], issuer: 'gitlab-pages')
      rescue JWT::DecodeError
        false
      end

      def secret_path
        Gitlab.config.pages.secret_file
      end

      def access_control_is_forced?
        ::Gitlab.config.pages.access_control &&
          ::Gitlab::CurrentSettings.current_application_settings.force_pages_access_control
      end

      def multiple_versions_enabled_for?(project)
        return false if project.blank?

        ::Feature.enabled?(:pages_multiple_versions_setting, project) &&
          project.licensed_feature_available?(:pages_multiple_versions) &&
          project.project_setting.pages_multiple_versions_enabled
      end
    end
  end
end
