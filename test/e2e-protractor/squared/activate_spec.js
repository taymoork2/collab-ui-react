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
        browser.get('#/activate?eqp=' + encodeURIComponent(iosData.encryptedQueryParam));
        navigation.expectAdminSettingsNotDisplayed();
      });

      it('should activate user and display success info', function () {
        utils.expectIsDisplayed(activate.provisionSuccess);
        utils.expectIsNotDisplayed(activate.codeExpired);
        utils.expectIsNotDisplayed(activate.resendSuccess);
      });
    });

    describe('Desktop activation after code is invalidated', function () {

      it('should display without admin controls on navigation bar', function () {
        browser.get('#/activate?eqp=' + encodeURIComponent(iosData.encryptedQueryParam));
        navigation.expectAdminSettingsNotDisplayed();
      });

      it('should display without admin controls on navigation bar', function () {
        var url = '#/activate?eqp=' + encodeURIComponent(iosData.encryptedQueryParam);
        browser.get(url);
        navigation.expectCurrentUrl(url);
        navigation.expectAdminSettingsNotDisplayed();
      });

      it('should display code expired with user email', function () {
        utils.expectIsNotDisplayed(activate.provisionSuccess);
        utils.expectIsDisplayed(activate.codeExpired);
        utils.expectIsNotDisplayed(activate.resendSuccess);
      });

      it('should request new code when link is clicked', function () {
        utils.click(activate.sendCodeLink);
        utils.expectIsNotDisplayed(activate.provisionSuccess);
        utils.expectIsNotDisplayed(activate.codeExpired);
        utils.expectIsDisplayed(activate.resendSuccess);
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
        browser.get('#/activate?eqp=' + encodeURIComponent(androidData.encryptedQueryParam));
        navigation.expectAdminSettingsNotDisplayed();
      });

      it('should activate user and display success info', function () {
        utils.expectIsDisplayed(activate.provisionSuccess);
        utils.expectIsNotDisplayed(activate.codeExpired);
        utils.expectIsNotDisplayed(activate.resendSuccess);
      });
    });

    it('should clean up', function () {
      deleteUtils.deleteUser(androidData.body.email);
    });
  });
});
