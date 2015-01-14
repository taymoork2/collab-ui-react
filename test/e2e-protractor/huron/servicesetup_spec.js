'use strict';

var testuser = {
  username: 'admin@uc.e2e.huron-alpha.com',
  password: 'C1sco123!'
};

var pattern = Math.ceil(Math.random()*Math.pow(10,5)).toString();

xdescribe('First Time Wizard - CiscoUC Service Setup', function() {
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
    wizard.clickServiceSetup();
    expect(wizard.mainviewTitle.getText()).toEqual('Unified Communications');
    expect(servicesetup.timeZone.isDisplayed()).toBeTruthy();
    expect(servicesetup.steeringDigit.isDisplayed()).toBeTruthy();
    expect(servicesetup.globalMOH.isDisplayed()).toBeTruthy();
  });

  it('should add a number range', function(){
    servicesetup.addNumberRange.click();
    var newRange = servicesetup.numberRanges.last();
    newRange.element(by.model('internalNumberRange.beginNumber')).sendKeys(pattern);
    newRange.element(by.model('internalNumberRange.endNumber')).sendKeys(pattern);
    servicesetup.save.click();
    notifications.assertSuccess('added successfully');
  });

  it('should delete the number range', function(){
    wizard.clickServiceSetup();
    servicesetup.deleteNumberRange(pattern);
    notifications.assertSuccess('deleted successfully');
  });

  it('should close the first time wizard and log out', function() {
    element(by.css('body')).sendKeys(protractor.Key.ESCAPE);
    browser.sleep(1000);
    navigation.logout();
  });
});
