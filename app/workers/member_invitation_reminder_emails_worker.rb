# frozen_string_literal: true

class MemberInvitationReminderEmailsWorker # rubocop:disable Scalability/IdempotentWorker
  include ApplicationWorker

  sidekiq_options retry: 3
  include CronjobQueue # rubocop:disable Scalability/CronWorkerContext

  feature_category :subgroups
  tags :exclude_from_kubernetes
  urgency :low

  def perform
    Member.not_accepted_invitations.not_expired.last_ten_days_excluding_today.find_in_batches do |invitations|
      invitations.each do |invitation|
        Members::InvitationReminderEmailService.new(invitation).execute
      end
    end
  end
end
