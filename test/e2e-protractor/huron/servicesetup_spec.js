'use strict';

describe('First Time Wizard - CiscoUC Service Setup', function () {
  var pattern = servicesetup.getPattern();

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should login as an admin user', function () {
    login.login('huron-e2e');
  });

  it('clicking on gear icon should open first time wizard', function () {
    navigation.clickFirstTimeWizard();
    utils.expectIsDisplayed(wizard.wizard);
    utils.expectIsDisplayed(wizard.leftNav);
    utils.expectIsDisplayed(wizard.mainView);
  });

  it('should load views according to left navigation clicks', function () {
    wizard.clickServiceSetup();
    utils.expectText(wizard.mainviewTitle, 'Unified Communications');
    utils.expectIsDisplayed(servicesetup.timeZone);
    utils.expectIsDisplayed(servicesetup.steeringDigit);
    utils.expectIsDisplayed(servicesetup.globalMOH);
    utils.expectIsDisplayed(servicesetup.numberRanges.first());
  });

  it('should add a number range', function () {
    utils.click(servicesetup.addNumberRange);
    utils.sendKeys(servicesetup.newBeginRange, pattern);
    utils.sendKeys(servicesetup.newEndRange, pattern);
    utils.click(servicesetup.save);
    notifications.assertSuccess('added successfully');
  });

  it('should delete the number range', function () {
    wizard.clickServiceSetup();
    servicesetup.deleteNumberRange(pattern);
    notifications.assertSuccess('deleted successfully');
  });

  it('should close the first time wizard and log out', function () {
    utils.clickEscape();

    navigation.logout();
  });
});
