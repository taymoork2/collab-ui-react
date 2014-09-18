'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-sso-org-admin@squared2webex.com',
  password: 'C1sc0123!'
};

describe('Directory Sync flow', function() {
  // Logging in. Write your tests after the login flow is complete.
  describe('Login as sso admin user', function() {

    it('should login', function(){
      login.loginSSO(testuser.username, testuser.password);
    });
  }); //State is logged-in

  describe('Manage tab - Dirsync flow', function() {
    it('clicking on manage tab should change the view', function() {
      navigation.manageTab.click();
      navigation.expectCurrentUrl('/orgs');
    });

    it('should display dirsync button and clicking it should launch the wizard', function() {
      utils.expectIsDisplayed(disyncwizard.btnDirSync);
      disyncwizard.btnDirSync.click();
      utils.expectIsDisplayed(disyncwizard.ssoModalHeader);
    });

    it('should display the Domain when the wizard launches', function() {
      utils.expectIsDisplayed(disyncwizard.domainCancelBtn);
      utils.expectIsDisplayed(disyncwizard.domainNextBtn);
      utils.expectIsDisplayed(disyncwizard.dirDomainText);
    });

    it('should close the wizard when Cancel button is clicked', function() {
      disyncwizard.domainCancelBtn.click();
      utils.expectIsDisplayed(disyncwizard.btnDirSync);
    });

    it('should navigate steps by clicking on Next and Previous buttons', function() {
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

    it('should successfully start directory sync on clicking Sync now button', function() {
      disyncwizard.domainNextBtn.click();
      utils.expectIsDisplayed(disyncwizard.syncNowBtn);
      disyncwizard.syncNowBtn.click();
      users.assertSuccess('Directory Sync In Progress');
    });

    it('should close the wizard when clicking on the X mark', function() {
      disyncwizard.closeSSOModal.click();
      utils.expectIsDisplayed(disyncwizard.btnDirSync);
    });
  });

  // Log Out
  describe('Log Out', function() {
    it('should log out', function() {
      utils.expectIsDisplayed(navigation.settings);
      navigation.settings.click();
      utils.expectIsDisplayed(navigation.logoutButton);
      navigation.logoutButton.click();
    });
  });
});
