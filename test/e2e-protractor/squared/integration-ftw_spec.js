'use strict';

/* global LONG_TIMEOUT */

describe('First Time Wizard', function () {

  it('should login as an admin user', function () {
    login.login('pbr-admin');
  });

  it('clicking on gear icon should open first time wizard', function () {
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should load views according to left navigation clicks', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Plan Review');
    wizard.clickEnterpriseSettings();
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
    wizard.clickAddUsers();
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
  });

  it('should complete custom sso provider flow', function () {
    wizard.clickPlanReview();
    utils.click(wizard.beginBtn);
    utils.click(wizard.saveBtn);
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'SIP Domain');
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Single Sign-On');
    utils.click(wizard.radiobuttons.last());
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Export Directory Metadata');
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Import IdP Metadata');
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Test SSO Setup');
  });

  it('should complete simple add users flow', function () {
    wizard.clickAddUsers();
    utils.click(wizard.manualAddUsers);
    notifications.clearNotifications();
    utils.click(wizard.nextBtn);
    utils.expectIsDisplayed(users.addUsersField);
    utils.click(wizard.finishBtn);
    utils.clickEscape();
    utils.expectIsNotDisplayed(wizard.wizard);
  }, LONG_TIMEOUT);

  it('should reopen the wizard', function () {
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  // The AD sync is not available for non-dirSyncEnabled org.
  // Need to re-visit when the bulk load is done.
  xit('should complete AD sync flow', function () {
    wizard.clickAddUsers();
    utils.click(wizard.radiobuttons.last());
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Domain Entry');
    utils.sendKeys(wizard.dirDomainInput, 'test_domain');
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Install Directory Connector');
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Sync Status');
    utils.click(wizard.nextBtn);
    utils.clickEscape();
    utils.expectIsNotDisplayed(wizard.wizard);
  });

  xit('should reopen the wizard', function () {
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should close the first time wizard and log out', function () {
    utils.clickEscape();
    utils.expectIsNotDisplayed(wizard.wizard);
  });
});
