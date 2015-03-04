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
    expect(wizard.mainviewTitle.getText()).toEqual('Plan Review');
    wizard.clickEnterpriseSettings();
    expect(wizard.mainviewTitle.getText()).toEqual('Enterprise Settings');
    wizard.clickAddUsers();
    expect(wizard.mainviewTitle.getText()).toContain('Add Users');
  });

  it('should complete custom sso provider flow', function(){
    wizard.clickPlanReview();
    wizard.beginBtn.click();
    expect(wizard.mainviewTitle.getText()).toEqual('Enterprise Settings');
    expect(wizard.mainviewSubtitle.getText()).toEqual('Single Sign-On');
    wizard.radiobuttons.get(1).click();
    utils.click(wizard.nextBtn);
    expect(wizard.mainviewSubtitle.getText()).toEqual('Import IdP Metadata');
    wizard.nextBtn.click();
    expect(wizard.mainviewSubtitle.getText()).toEqual('Export Cloud Metadata');
    wizard.nextBtn.click();
    expect(wizard.mainviewSubtitle.getText()).toEqual('Test SSO Setup');
    wizard.finishBtn.click();
    expect(wizard.mainviewTitle.isDisplayed()).toBeTruthy();
  });

  it('should complete simple invite users flow', function() {
    wizard.clickAddUsers();
    wizard.radiobuttons.get(0).click();
    browser.sleep(1000);
    wizard.nextBtn.click();
    browser.sleep(1000);
    expect(users.addUsersField.isDisplayed()).toBeTruthy();
    browser.sleep(1000);
    wizard.finishBtn.click();

    expect(wizard.fusionIntro.isDisplayed()).toBeTruthy();
    wizard.nextBtn.click();
    expect(wizard.fusionFuse.isDisplayed()).toBeTruthy();
    wizard.finishBtn.click();
  }, 60000);

  it('should reopen the wizard', function() {
    element(by.css('body')).sendKeys(protractor.Key.ESCAPE);
    browser.sleep(1000);
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should complete AD sync flow', function() {
    wizard.clickAddUsers();
    wizard.radiobuttons.get(1).click();
    wizard.nextBtn.click();
    expect(wizard.mainviewSubtitle.getText()).toEqual('Domain Entry');
    expect(wizard.mainviewSubtitle.isDisplayed()).toBeTruthy();
    wizard.dirDomainInput.sendKeys('test_domain');
    wizard.nextBtn.click();
    expect(wizard.mainviewSubtitle.getText()).toEqual('Install Cloud Connector');
    expect(wizard.mainviewSubtitle.isDisplayed()).toBeTruthy();
    wizard.nextBtn.click();
    expect(wizard.mainviewSubtitle.getText()).toEqual('Sync Status');
    expect(wizard.mainviewSubtitle.isDisplayed()).toBeTruthy();
    utils.click(wizard.finishBtn);
  });

  it('should reopen the wizard', function() {
    element(by.css('body')).sendKeys(protractor.Key.ESCAPE);
    browser.sleep(1000);
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should close the first time wizard and log out', function() {
    element(by.css('body')).sendKeys(protractor.Key.ESCAPE);
    browser.sleep(1000);
    navigation.logout();
  });
});
