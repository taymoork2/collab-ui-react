'use strict';

describe('First Time Wizard - CiscoUC Service Setup', function () {
  var pattern = servicesetup.getPattern();
  var pattern1 = parseInt(pattern) + 1;
  var pattern2 = parseInt(pattern) + 2;

  beforeAll(function () {
    login.login('huron-int1');
  }, 120000);

  it('should open communication wizard', function () {
    navigation.clickCommunicationWizard();
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Call Settings');
    utils.expectIsDisplayed(servicesetup.timeZone);
    utils.expectIsDisplayed(servicesetup.steeringDigit);
    utils.expectIsDisplayed(servicesetup.globalMOH);
    utils.expectIsDisplayed(servicesetup.companyVoicemail);
    utils.expectIsDisplayed(servicesetup.numberRanges.first());
  });

  it('should add a number range', function () {
    utils.click(servicesetup.addNumberRange);
    utils.sendKeys(servicesetup.newBeginRange, pattern);
    utils.sendKeys(servicesetup.newEndRange, pattern1);
    utils.click(wizard.saveBtn);
    notifications.assertSuccess('saved successfully');
  });

  it('should not add a single number range', function () {
    wizard.clickServiceSetup();
    utils.click(servicesetup.addNumberRange);
    utils.sendKeys(servicesetup.newBeginRange, pattern2);
    utils.sendKeys(servicesetup.newEndRange, pattern2);
    utils.click(wizard.saveBtn);
    notifications.assertError('Errors exist');
  });

  it('should delete the number range', function () {
    servicesetup.deleteNumberRange(pattern);
    notifications.assertSuccess('Successfully deleted');
  });

});
