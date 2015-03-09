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
    utils.click(disyncwizard.btnDirSync);
    utils.expectIsDisplayed(disyncwizard.ssoModalHeader);
  });

  it('should display the Domain when the wizard launches', function () {
    utils.expectIsDisplayed(disyncwizard.domainCancelBtn);
    utils.expectIsDisplayed(disyncwizard.domainNextBtn);
    utils.expectIsDisplayed(disyncwizard.dirDomainText);
  });

  it('should close the wizard when Cancel button is clicked', function () {
    utils.click(disyncwizard.domainCancelBtn);
    utils.expectIsNotDisplayed(disyncwizard.ssoModalHeader);
  });

  it('should navigate steps by clicking on Next and Previous buttons', function () {
    utils.click(disyncwizard.btnDirSync);
    utils.expectIsDisplayed(disyncwizard.ssoModalHeader);

    utils.click(disyncwizard.domainNextBtn);
    utils.expectIsDisplayed(disyncwizard.syncNowBtn);
    utils.expectIsDisplayed(disyncwizard.installCancelBtn);
    utils.expectIsDisplayed(disyncwizard.installBackBtn);
    utils.expectIsDisplayed(disyncwizard.installNextBtn);

    utils.click(disyncwizard.installNextBtn);
    utils.expectIsDisplayed(disyncwizard.synchCancelBtn);
    utils.expectIsDisplayed(disyncwizard.synchBackBtn);
    utils.expectIsDisplayed(disyncwizard.synchFinishBtn);

    utils.click(disyncwizard.synchBackBtn);
    utils.expectIsDisplayed(disyncwizard.syncNowBtn);
    utils.expectIsDisplayed(disyncwizard.installCancelBtn);
    utils.expectIsDisplayed(disyncwizard.installBackBtn);
    utils.expectIsDisplayed(disyncwizard.installNextBtn);

    utils.click(disyncwizard.installBackBtn);
    utils.expectIsDisplayed(disyncwizard.domainCancelBtn);
    utils.expectIsDisplayed(disyncwizard.domainNextBtn);
    utils.expectIsDisplayed(disyncwizard.dirDomainText);

  });

  it('should successfully start directory sync on clicking Sync now button', function () {
    utils.click(disyncwizard.domainNextBtn);
    utils.click(disyncwizard.syncNowBtn);
    notifications.assertSuccess('Directory Sync In Progress');
  });

  it('should close the wizard when clicking on the X mark', function () {
    utils.click(disyncwizard.closeSSOModal);
    utils.expectIsNotDisplayed(disyncwizard.ssoModalHeader);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
