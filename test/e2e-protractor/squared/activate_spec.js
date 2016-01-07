'use strict';

describe('Self Registration Activation Page', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = false;
  });

  afterEach(function () {
    browser.ignoreSynchronization = true;
    utils.dumpConsoleErrors();
  });

  describe('ios', function () {
    var iosData = null;

    beforeEach(function () {
      iosData = iosData || activate.setup(config.deviceUserAgent.iPhone);
    });

    describe('Desktop activation for iOS device', function () {
      it('should display without admin controls on navigation bar', function () {
        if (iosData.encryptedQueryParam) {
          browser.get('#/activate?eqp=' + encodeURIComponent(iosData.encryptedQueryParam));
          navigation.expectAdminSettingsNotDisplayed();
        }
      });

      it('should activate user and display success info', function () {
        if (iosData.encryptedQueryParam) {
          utils.expectIsDisplayed(activate.provisionSuccess);
          utils.expectIsNotDisplayed(activate.codeExpired);
          utils.expectIsNotDisplayed(activate.resendSuccess);
        }
      });

    });

    describe('Desktop activation after code is invalidated', function () {

      it('should display without admin controls on navigation bar', function () {
        if (iosData.encryptedQueryParam) {
          browser.get('#/activate?eqp=' + encodeURIComponent(iosData.encryptedQueryParam));
          navigation.expectAdminSettingsNotDisplayed();
        }
      });

      it('should display without admin controls on navigation bar', function () {
        if (iosData.encryptedQueryParam) {
          var url = '#/activate?eqp=' + encodeURIComponent(iosData.encryptedQueryParam);
          browser.get(url);
          navigation.expectCurrentUrl(url);
          navigation.expectAdminSettingsNotDisplayed();
        }
      });

      it('should display code expired with user email', function () {
        if (iosData.encryptedQueryParam) {
          utils.expectIsNotDisplayed(activate.provisionSuccess);
          utils.expectIsDisplayed(activate.codeExpired);
          utils.expectIsNotDisplayed(activate.resendSuccess);
          // utils.expectText(activate.userEmail, iosData.body.email);
        }
      });

      it('should request new code when link is clicked', function () {
        if (iosData.encryptedQueryParam) {
          utils.click(activate.sendCodeLink);
          utils.expectIsNotDisplayed(activate.provisionSuccess);
          utils.expectIsNotDisplayed(activate.codeExpired);
          utils.expectIsDisplayed(activate.resendSuccess);

          // activate.expectNewEqp();
        }
      });
    });

    it('should clean up ios data', function () {
      deleteUtils.deleteUser(iosData.body.email);
    });
  });

  describe('android', function () {
    var androidData = null;

    beforeEach(function () {
      androidData = androidData || activate.setup(config.deviceUserAgent.android);
    });

    describe('Desktop activation for android device', function () {
      it('should display without admin controls on navigation bar', function () {
        if (androidData.encryptedQueryParam) {
          browser.get('#/activate?eqp=' + encodeURIComponent(androidData.encryptedQueryParam));
          navigation.expectAdminSettingsNotDisplayed();
        }
      });

      it('should activate user and display success info', function () {
        if (androidData.encryptedQueryParam) {
          utils.expectIsDisplayed(activate.provisionSuccess);
          utils.expectIsNotDisplayed(activate.codeExpired);
          utils.expectIsNotDisplayed(activate.resendSuccess);
        }
      });
    });

    it('should clean up', function () {
      deleteUtils.deleteUser(androidData.body.email);
    });
  });
});
