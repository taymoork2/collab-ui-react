'use strict';

describe('First Time Wizard EE selfsign-sso', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

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
  });

  it('should go to upload Metadata page', function () {
    wizard.clickPlanReview();
    utils.click(wizard.beginBtn);
    utils.click(wizard.saveBtn);
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Single Sign-On');
    utils.click(wizard.radiobuttons.last());
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Export Directory Metadata');
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Import IdP Metadata');
    utils.click(wizard.radiobuttons.first());
    utils.click(wizard.radiobuttons.last());
  });

  it('should complete custom sso provider flow', function () {
    utils.click(wizard.nextBtn);
    utils.expectTextToBeSet(wizard.mainviewSubtitle, 'Test SSO Setup');
    utils.click(wizard.radiobuttons.first());
    utils.click(wizard.finishBtn);
    utils.expectIsDisplayed(wizard.mainviewTitle);
  });

  it('should close the first time wizard and log out', function () {
    utils.clickEscape();
    utils.expectIsNotDisplayed(wizard.wizard);
  });
});
