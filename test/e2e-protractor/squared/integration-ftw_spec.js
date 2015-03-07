'use strict';

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!'
};

describe('First Time Wizard', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });
  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should login as an admin user', function () {
    login.login(testuser.username, testuser.password);
  });

  it('clicking on gear icon should open first time wizard', function () {
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should load views according to left navigation clicks', function () {
    wizard.clickPlanReview();
    utils.expectText(wizard.mainviewTitle, 'Plan Review');
    wizard.clickEnterpriseSettings();
    utils.expectText(wizard.mainviewTitle, 'Enterprise Settings');
    wizard.clickAddUsers();
    utils.expectText(wizard.mainviewTitle, 'Add Users');
  });

  it('should complete custom sso provider flow', function () {
    wizard.clickPlanReview();
    utils.click(wizard.beginBtn);
    utils.expectText(wizard.mainviewTitle, 'Enterprise Settings');
    utils.expectText(wizard.mainviewSubtitle, 'Single Sign-On');
    utils.click(wizard.radiobuttons.last());
    utils.click(wizard.nextBtn);
    utils.expectText(wizard.mainviewSubtitle, 'Export Cloud Metadata');
    utils.click(wizard.nextBtn);
    utils.expectText(wizard.mainviewSubtitle, 'Import IdP Metadata');
    utils.click(wizard.nextBtn);
    utils.expectText(wizard.mainviewSubtitle, 'Test SSO Setup');
    utils.click(wizard.finishBtn);
    utils.expectIsDisplayed(wizard.mainviewTitle);
  });

  it('should complete simple invite users flow', function () {
    wizard.clickAddUsers();
    utils.click(wizard.radiobuttons.first());
    utils.click(wizard.nextBtn);
    utils.expectIsDisplayed(users.addUsersField);
    utils.click(wizard.finishBtn);

    utils.expectIsDisplayed(wizard.fusionIntro);
    utils.click(wizard.nextBtn);
    utils.expectIsDisplayed(wizard.fusionFuse);
    utils.click(wizard.finishBtn);
  }, 60000);

  it('should reopen the wizard', function () {
    element(by.css('body')).sendKeys(protractor.Key.ESCAPE);
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should complete AD sync flow', function () {
    wizard.clickAddUsers();
    utils.click(wizard.radiobuttons.last());
    utils.click(wizard.nextBtn);
    utils.expectText(wizard.mainviewSubtitle, 'Domain Entry');
    wizard.dirDomainInput.sendKeys('test_domain');
    utils.click(wizard.nextBtn);
    utils.expectText(wizard.mainviewSubtitle, 'Install Cloud Connector');
    utils.click(wizard.nextBtn);
    utils.expectText(wizard.mainviewSubtitle, 'Sync Status');
    utils.click(wizard.finishBtn);
  });

  it('should reopen the wizard', function () {
    element(by.css('body')).sendKeys(protractor.Key.ESCAPE);
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should close the first time wizard and log out', function () {
    element(by.css('body')).sendKeys(protractor.Key.ESCAPE);
    navigation.logout();
  });
});
