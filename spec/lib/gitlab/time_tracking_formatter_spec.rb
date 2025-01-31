# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Gitlab::TimeTrackingFormatter, feature_category: :team_planning do
  describe '#parse' do
    let(:keep_zero) { false }

    subject { described_class.parse(duration_string, keep_zero: keep_zero) }

    context 'positive durations' do
      let(:duration_string) { '3h 20m' }

      it { expect(subject).to eq(12_000) }

      context 'when update_chronic_duration is false' do
        before do
          stub_feature_flags(update_chronic_duration: false)
        end

        it { expect(subject).to eq(12_000) }
      end
    end

    context 'negative durations' do
      let(:duration_string) { '-3h 20m' }

      it { expect(subject).to eq(-12_000) }

      context 'when update_chronic_duration is false' do
        before do
          stub_feature_flags(update_chronic_duration: false)
        end

        it { expect(subject).to eq(-12_000) }
      end
    end

    context 'durations with months' do
      let(:duration_string) { '1mo' }

      it 'uses our custom conversions' do
        expect(subject).to eq(576_000)
      end

      context 'when update_chronic_duration is false' do
        before do
          stub_feature_flags(update_chronic_duration: false)
        end

        it 'uses our custom conversions' do
          expect(subject).to eq(576_000)
        end
      end
    end

    context 'when the duration is nil' do
      let(:duration_string) { nil }

      it 'returns nil' do
        expect(subject).to be_nil
      end
    end

    context 'when the duration is zero' do
      let(:duration_string) { '0h' }

      context 'when keep_zero is false' do
        it 'returns nil' do
          expect(subject).to be_nil
        end

        context 'when update_chronic_duration is false' do
          before do
            stub_feature_flags(update_chronic_duration: false)
          end

          it 'returns nil' do
            expect(subject).to be_nil
          end
        end
      end

      context 'when keep_zero is true' do
        let(:keep_zero) { true }

        it 'returns zero' do
          expect(subject).to eq(0)
        end

        context 'when update_chronic_duration is false' do
          before do
            stub_feature_flags(update_chronic_duration: false)
          end

          it 'returns zero' do
            expect(subject).to eq(0)
          end
        end
      end
    end
  end

  describe '#output' do
    let(:num_seconds) { 178_800 }

    subject { described_class.output(num_seconds) }

    context 'time_tracking_limit_to_hours setting is true' do
      before do
        stub_application_setting(time_tracking_limit_to_hours: true)
      end

      it { expect(subject).to eq('49h 40m') }
    end

    context 'time_tracking_limit_to_hours setting is false' do
      before do
        stub_application_setting(time_tracking_limit_to_hours: false)
      end

      it { expect(subject).to eq('1w 1d 1h 40m') }
    end

    context 'handles negative time input' do
      let(:num_seconds) { -178_800 }

      it { expect(subject).to eq('-1w 1d 1h 40m') }
    end
  end
end
