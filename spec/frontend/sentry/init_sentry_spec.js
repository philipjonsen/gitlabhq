import {
  BrowserClient,
  defaultStackParser,
  makeFetchTransport,
  defaultIntegrations,

  // exports
  captureException,
  captureMessage,
  withScope,
  SDK_VERSION,
} from 'sentrybrowser';
import * as Sentry from 'sentrybrowser';

import { initSentry } from '~/sentry/init_sentry';

const mockDsn = 'https://123@sentry.gitlab.test/123';
const mockEnvironment = 'development';
const mockCurrentUserId = 1;
const mockGitlabUrl = 'https://gitlab.com';
const mockVersion = '1.0.0';
const mockRevision = '00112233';
const mockFeatureCategory = 'my_feature_category';
const mockPage = 'index:page';

jest.mock('sentrybrowser', () => {
  return {
    ...jest.createMockFromModule('sentrybrowser'),

    // unmock actual configuration options
    defaultStackParser: jest.requireActual('sentrybrowser').defaultStackParser,
    makeFetchTransport: jest.requireActual('sentrybrowser').makeFetchTransport,
    defaultIntegrations: jest.requireActual('sentrybrowser').defaultIntegrations,
  };
});

describe('SentryConfig', () => {
  let mockBindClient;
  let mockSetTags;
  let mockSetUser;
  let mockBrowserClient;
  let mockStartSession;
  let mockCaptureSession;

  beforeEach(() => {
    window.gon = {
      sentry_dsn: mockDsn,
      sentry_environment: mockEnvironment,
      current_user_id: mockCurrentUserId,
      gitlab_url: mockGitlabUrl,
      version: mockVersion,
      revision: mockRevision,
      feature_category: mockFeatureCategory,
    };

    document.body.dataset.page = mockPage;

    mockBindClient = jest.fn();
    mockSetTags = jest.fn();
    mockSetUser = jest.fn();
    mockStartSession = jest.fn();
    mockCaptureSession = jest.fn();
    mockBrowserClient = jest.spyOn(Sentry, 'BrowserClient');

    jest.spyOn(Sentry, 'getCurrentHub').mockReturnValue({
      bindClient: mockBindClient,
      setTags: mockSetTags,
      setUser: mockSetUser,
      startSession: mockStartSession,
      captureSession: mockCaptureSession,
    });
  });

  afterEach(() => {
    // eslint-disable-next-line no-underscore-dangle
    window._Sentry = undefined;
  });

  describe('initSentry', () => {
    describe('when sentry is initialized', () => {
      beforeEach(() => {
        initSentry();
      });

      it('creates BrowserClient with gon values and configuration', () => {
        expect(mockBrowserClient).toHaveBeenCalledWith(
          expect.objectContaining({
            dsn: mockDsn,
            release: mockVersion,
            allowUrls: [mockGitlabUrl, 'webpack-internal://'],
            environment: mockEnvironment,

            transport: makeFetchTransport,
            stackParser: defaultStackParser,
            integrations: defaultIntegrations,
          }),
        );
      });

      it('binds the BrowserClient to the hub', () => {
        expect(mockBindClient).toHaveBeenCalledTimes(1);
        expect(mockBindClient).toHaveBeenCalledWith(expect.any(BrowserClient));
      });

      it('calls Sentry.setTags with gon values', () => {
        expect(mockSetTags).toHaveBeenCalledTimes(1);
        expect(mockSetTags).toHaveBeenCalledWith({
          page: mockPage,
          revision: mockRevision,
          feature_category: mockFeatureCategory,
        });
      });

      it('calls Sentry.setUser with gon values', () => {
        expect(mockSetUser).toHaveBeenCalledTimes(1);
        expect(mockSetUser).toHaveBeenCalledWith({
          id: mockCurrentUserId,
        });
      });

      it('sets global sentry', () => {
        // eslint-disable-next-line no-underscore-dangle
        expect(window._Sentry).toEqual({
          captureException,
          captureMessage,
          withScope,
          SDK_VERSION,
        });
      });
    });

    describe('when user is not logged in', () => {
      beforeEach(() => {
        window.gon.current_user_id = undefined;
        initSentry();
      });

      it('does not call Sentry.setUser', () => {
        expect(mockSetUser).not.toHaveBeenCalled();
      });
    });

    describe('when gon is not defined', () => {
      beforeEach(() => {
        window.gon = undefined;
        initSentry();
      });

      it('Sentry.init is not called', () => {
        expect(mockBrowserClient).not.toHaveBeenCalled();
        expect(mockBindClient).not.toHaveBeenCalled();

        // eslint-disable-next-line no-underscore-dangle
        expect(window._Sentry).toBe(undefined);
      });
    });

    describe('when dsn is not configured', () => {
      beforeEach(() => {
        window.gon.sentry_dsn = undefined;
        initSentry();
      });

      it('Sentry.init is not called', () => {
        expect(mockBrowserClient).not.toHaveBeenCalled();
        expect(mockBindClient).not.toHaveBeenCalled();

        // eslint-disable-next-line no-underscore-dangle
        expect(window._Sentry).toBe(undefined);
      });
    });
  });
});
