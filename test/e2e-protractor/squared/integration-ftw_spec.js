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

describe('First Time Wizard', function() {
  it('should login as an admin user', function(){
    login.login(testuser.username, testuser.password);
  });

  it('clicking on gear icon should open first time wizard', function() {
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should load views according to left navigation clicks', function() {
    wizard.clickPlanReview();
    expect(wizard.mainviewTitles.get(0).getText()).toEqual('Plan Review');
    wizard.clickEnterpriseSettings();
    expect(wizard.mainviewTitles.get(1).getText()).toEqual('Enterprise Settings');
    wizard.clickAddUsers();
    expect(wizard.mainviewTitles.get(6).getText()).toContain('Add Users');
  });

  it('should complete custom sso provider flow', function(){
    wizard.clickPlanReview();
    browser.driver.manage().window().setSize(1195, 569); //need to make the window bigger to see buttons
    browser.driver.manage().window().maximize();
    element(by.id('beginBtn')).click();
    expect(wizard.mainviewTitles.get(1).getText()).toEqual('Enterprise Settings');
    expect(wizard.mainviewSubtitles.get(1).getText()).toEqual('Setup Single Sign-On');
    wizard.radiobuttons.get(0).click();
    wizard.esEvaluateBtn.click();
    expect(wizard.mainviewSubtitles.get(2).getText()).toEqual('Import IdP Metadata');
    wizard.toExpCloudDataBtn.get(0).click();
    expect(wizard.mainviewSubtitles.get(3).getText()).toEqual('Export Cloud Metadata');
    wizard.toTestSSOBtn.get(0).click();
    expect(wizard.mainviewSubtitles.get(4).getText()).toEqual('Test SSO Setup');
    wizard.toEnableSSOBtn.click();
    expect(wizard.mainviewSubtitles.get(5).getText()).toEqual('Enable SSO');
    wizard.enableSSOBtn.click();
    expect(wizard.mainviewTitles.get(6).isDisplayed()).toBeTruthy();
  });

  it('should complete simple invite users flow', function() {
    wizard.clickAddUsers();
    wizard.radiobuttons.get(2).click();
    wizard.auEvaluateBtn.click();
    // expect(wizard.mainviewSubtitles.get(7).getText()).toEqual('Manual Invite');
    // expect(wizard.mainviewSubtitles.get(7).isDisplayed()).toBeTruthy();
    expect(wizard.usersfield.isDisplayed()).toBeTruthy();
    wizard.finishBtn.get(1).click();
    expect(wizard.mainviewTitles.get(11).getText()).toEqual('Get Started');
    expect(wizard.mainviewTitles.get(11).isDisplayed()).toBeTruthy();
  });

  it('should complete AD sync flow', function() {
    wizard.clickAddUsers();
    wizard.radiobuttons.get(3).click();
    wizard.auEvaluateBtn.click();
    expect(wizard.mainviewSubtitles.get(7).getText()).toEqual('Domain Entry');
    expect(wizard.mainviewSubtitles.get(7).isDisplayed()).toBeTruthy();
    wizard.dirDomainInput.sendKeys('test_domain');
    wizard.toInstallConnectorBtn.get(0).click();
    expect(wizard.mainviewSubtitles.get(8).getText()).toEqual('Install Cloud Connector');
    expect(wizard.mainviewSubtitles.get(8).isDisplayed()).toBeTruthy();
    wizard.toSyncStatusBtn.get(0).click();
    expect(wizard.mainviewSubtitles.get(9).getText()).toEqual('Sync Status');
    expect(wizard.mainviewSubtitles.get(9).isDisplayed()).toBeTruthy();
    wizard.finishBtn.get(2).click();
    expect(wizard.mainviewTitles.get(11).getText()).toEqual('Get Started');
    expect(wizard.mainviewTitles.get(11).isDisplayed()).toBeTruthy();
  });

  it('should close the first time wizard and log out', function() {
    wizard.closeBtn.click();
    navigation.logout();
  });
});
