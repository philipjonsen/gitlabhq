import { shallowMount } from '@vue/test-utils';

import SignInPage from '~/jira_connect/subscriptions/pages/sign_in/sign_in_page.vue';
import SignInGitlabCom from '~/jira_connect/subscriptions/pages/sign_in/sign_in_gitlab_com.vue';
import SignInGitlabMultiversion from '~/jira_connect/subscriptions/pages/sign_in/sign_in_gitlab_multiversion/index.vue';
import createStore from '~/jira_connect/subscriptions/store';

describe('SignInPage', () => {
  let wrapper;
  let store;

  const findSignInGitlabCom = () => wrapper.findComponent(SignInGitlabCom);
  const findSignInGitabMultiversion = () => wrapper.findComponent(SignInGitlabMultiversion);

  const createComponent = ({
    props = {},
    jiraConnectOauthEnabled,
    jiraConnectOauthSelfManagedEnabled,
  } = {}) => {
    store = createStore();

    wrapper = shallowMount(SignInPage, {
      store,
      provide: {
        glFeatures: {
          jiraConnectOauth: jiraConnectOauthEnabled,
          jiraConnectOauthSelfManaged: jiraConnectOauthSelfManagedEnabled,
        },
      },
      propsData: { hasSubscriptions: false, ...props },
    });
  };

  afterEach(() => {
    wrapper.destroy();
  });

  it.each`
    jiraConnectOauthEnabled | shouldRenderDotCom | shouldRenderMultiversion
    ${false}                | ${true}            | ${false}
    ${false}                | ${true}            | ${false}
    ${true}                 | ${false}           | ${true}
    ${true}                 | ${false}           | ${true}
  `(
    'renders correct component when jiraConnectOauth is $jiraConnectOauthEnabled',
    ({ jiraConnectOauthEnabled, shouldRenderDotCom, shouldRenderMultiversion }) => {
      createComponent({ jiraConnectOauthEnabled });

      expect(findSignInGitlabCom().exists()).toBe(shouldRenderDotCom);
      expect(findSignInGitabMultiversion().exists()).toBe(shouldRenderMultiversion);
    },
  );
});
