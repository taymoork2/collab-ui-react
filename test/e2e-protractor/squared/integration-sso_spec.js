'use strict';

/*
Debug info: If the this test is failing, try downloading a new metadata file from the following URL.
We can get the metadata from https://dojonst-win2k12.atlasad.koalabait.com/FederationMetadata/2007-06/FederationMetadata.xml. 
If the server is down then we would need to contact Don Johnston or Stephen Cristensen.
Don Johnston is the server admin and can help resolve the issue. 
*/
describe('First Time Wizard', function () {
  it('should login as an admin user into the SSO test-org', function () {
    login.loginThroughGui(helper.auth['sso-e2e-test-org-mailsac'].user, helper.auth['sso-e2e-test-org-mailsac'].pass, '#/overview');
  });

  describe('should complete custom sso provider flow', function () {
    it('should navigate to the SSO Settings page from overview page sso card', function () {
      utils.click(ssowizard.viewSsoSettings);
      utils.waitForText(wizard.mainviewSubtitle, 'Single Sign-On');
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
      utils.waitForText(wizard.mainviewSubtitle, 'Import IdP Metadata');
      ssowizard.uploadMetaData();
    });

    it('should test the SSO connection', function () {
      utils.click(wizard.nextBtn);
      utils.waitForText(wizard.mainviewSubtitle, 'Test SSO Setup');
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
