'use strict';

var testuser = {
  username: 'admin@int1.huron-alpha.com',
  password: 'Cisco123!'
};

var pattern = Math.ceil(Math.random() * Math.pow(10, 5)).toString();

xdescribe('First Time Wizard - CiscoUC Service Setup', function () {
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
    wizard.clickServiceSetup();
    expect(wizard.mainviewTitle.getText()).toEqual('Unified Communications');
    utils.expectIsDisplayed(servicesetup.timeZone);
    utils.expectIsDisplayed(servicesetup.steeringDigit);
    utils.expectIsDisplayed(servicesetup.globalMOH);
    utils.expectIsDisplayed(servicesetup.numberRanges.first());
  });

  it('should add a number range', function () {
    utils.click(servicesetup.addNumberRange);
    var newRange = servicesetup.numberRanges.last();
    newRange.element(by.model('internalNumberRange.beginNumber')).sendKeys(pattern);
    newRange.element(by.model('internalNumberRange.endNumber')).sendKeys(pattern);
    utils.click(servicesetup.save);
    notifications.assertSuccess('added successfully');
  });

  it('should delete the number range', function () {
    wizard.clickServiceSetup();
    servicesetup.deleteNumberRange(pattern);
    notifications.assertSuccess('deleted successfully');
  });

  it('should close the first time wizard and log out', function () {
    element(by.css('body')).sendKeys(protractor.Key.ESCAPE);

    navigation.logout();
  });
});
