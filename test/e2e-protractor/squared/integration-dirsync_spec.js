'use strict';

/* global it */

var testuser = {
  username: 'pbr-sso-org-admin@squared2webex.com',
  password: 'C1sc0123!'
};

xdescribe('Directory Sync flow', function () {
  it('should login as sso admin user', function () {
    login.loginSSO(testuser.username, testuser.password);
  });

  it('clicking on manage tab should change the view', function () {
    navigation.clickOrganization();
  });

  it('should display dirsync button and clicking it should launch the wizard', function () {
    utils.expectIsDisplayed(disyncwizard.btnDirSync);
    disyncwizard.btnDirSync.click();
    utils.expectIsDisplayed(disyncwizard.ssoModalHeader);
  });

  it('should display the Domain when the wizard launches', function () {
    utils.expectIsDisplayed(disyncwizard.domainCancelBtn);
    utils.expectIsDisplayed(disyncwizard.domainNextBtn);
    utils.expectIsDisplayed(disyncwizard.dirDomainText);
  });

  it('should close the wizard when Cancel button is clicked', function () {
    disyncwizard.domainCancelBtn.click();
    utils.expectIsDisplayed(disyncwizard.btnDirSync);
  });

  it('should navigate steps by clicking on Next and Previous buttons', function () {
    disyncwizard.btnDirSync.click();
    utils.expectIsDisplayed(disyncwizard.ssoModalHeader);

    disyncwizard.domainNextBtn.click();
    utils.expectIsDisplayed(disyncwizard.syncNowBtn);
    utils.expectIsDisplayed(disyncwizard.installCancelBtn);
    utils.expectIsDisplayed(disyncwizard.installBackBtn);
    utils.expectIsDisplayed(disyncwizard.installNextBtn);

    disyncwizard.installNextBtn.click();
    utils.expectIsDisplayed(disyncwizard.synchCancelBtn);
    utils.expectIsDisplayed(disyncwizard.synchBackBtn);
    utils.expectIsDisplayed(disyncwizard.synchFinishBtn);

    disyncwizard.synchBackBtn.click();
    utils.expectIsDisplayed(disyncwizard.syncNowBtn);
    utils.expectIsDisplayed(disyncwizard.installCancelBtn);
    utils.expectIsDisplayed(disyncwizard.installBackBtn);
    utils.expectIsDisplayed(disyncwizard.installNextBtn);

    disyncwizard.installBackBtn.click();
    utils.expectIsDisplayed(disyncwizard.domainCancelBtn);
    utils.expectIsDisplayed(disyncwizard.domainNextBtn);
    utils.expectIsDisplayed(disyncwizard.dirDomainText);

  });

  it('should successfully start directory sync on clicking Sync now button', function () {
    disyncwizard.domainNextBtn.click();
    utils.expectIsDisplayed(disyncwizard.syncNowBtn);
    disyncwizard.syncNowBtn.click();
    notifications.assertSuccess('Directory Sync In Progress');
  });

  it('should close the wizard when clicking on the X mark', function () {
    disyncwizard.closeSSOModal.click();
    utils.expectIsDisplayed(disyncwizard.btnDirSync);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
