# frozen_string_literal: true

class Admin::JobsController < Admin::ApplicationController
  BUILDS_PER_PAGE = 30

  feature_category :continuous_integration
  urgency :low

  before_action do
    push_frontend_feature_flag(:admin_jobs_filter_runner_type, type: :ops)
  end

  def index
    # We need all builds for tabs counters
    @all_builds = Ci::JobsFinder.new(current_user: current_user).execute

    @scope = params[:scope]
    @builds = Ci::JobsFinder.new(current_user: current_user, params: params).execute
    @builds = @builds.eager_load_everything
    @builds = @builds.page(params[:page]).per(BUILDS_PER_PAGE).without_count
  end

  def cancel_all
    Ci::Build.running_or_pending.each(&:cancel)

    redirect_to admin_jobs_path, status: :see_other
  end
end
