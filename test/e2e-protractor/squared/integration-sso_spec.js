'use strict';

/* global LONG_TIMEOUT */

describe('First Time Wizard', function () {

  it('should login as an admin user into the SSO test-org', function () {
    login.loginThroughGui(helper.auth['sso-e2e-test-org-mailsac'].user, helper.auth['sso-e2e-test-org-mailsac'].pass, '#/overview');
  });

  describe('should complete custom sso provider flow', function () {

    it('should navigate to the SSO Settings page from overview page sso card', function () {
      utils.click(ssowizard.viewSsoSettings);
      utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Single Sign-On');
      utils.click(wizard.radiobuttons.last());
      utils.click(wizard.beginBtn);
    });

    it('should verify that the download link is correct', function () {
      utils.waitForAttributeToContain(ssowizard.downloadMeta, 'href', 'blob:http://127.0.0.1:8000/');
    });

    xit('should download the MetaData and verify it was downloaded successfully', function () {
      ssowizard.testBrowserFileDownload('/tmp/downloads/idb-meta-3aa8a8a2-b953-4905-b678-0ae0a3f489f8-SP.xml');
    });

    it('should upload the Federation MetaData', function () {
      utils.click(wizard.nextBtn);
      utils.click(wizard.radiobuttons.last());
      utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Import IdP Metadata');
      ssowizard.uploadMetaData();
    });

    it('should test the SSO connection', function () {
      utils.click(wizard.nextBtn);
      utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Test SSO Setup');
      utils.click(ssowizard.testSsoConnectionBtn);
      utils.switchToNewWindow()
        .then(loginActiveDirectoryFederationService)
        .then(expectSuccess)
        .then(switchToOriginalWindow)
        .then(disableSsoBeforeExit);

      function loginActiveDirectoryFederationService() {
        return login.loginActiveDirectoryFederationServices('sso-e2e-test-org-mailsac');
      }

      function expectSuccess() {
        return ssowizard.expectSSOSucceeded();
      }

      function switchToOriginalWindow() {
        return utils.closeAndSwitchToOriginalWindow();
      }

      function disableSsoBeforeExit() {
        utils.click(wizard.radiobuttons.last());
        utils.click(wizard.saveBtn);
      }
    });

  });

  it('should close the first time wizard and log out', function () {
    utils.clickEscape();
    utils.expectIsNotDisplayed(wizard.wizard);
    navigation.logout();
  });

});
