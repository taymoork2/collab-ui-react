'use strict';

describe('Single Number Reach', function () {
  var user = utils.randomTestGmail();
  var snrLine = telephony.getRandomNumber();

  beforeAll(function () {
    utils.loginAndCreateHuronUser('huron-int1', user);
  }, 120000);

  it('should open the communcations panel', function () {
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
  });

  it('should save the enabled state', function () {
    utils.expectText(telephony.snrStatus, 'Off');
    utils.click(telephony.snrFeature);
    utils.expectIsDisplayed(telephony.snrTitle);
    utils.expectSwitchState(telephony.snrSwitch, false);
    utils.expectIsNotDisplayed(telephony.snrNumber);

    utils.click(telephony.snrSwitch);
    utils.expectIsDisplayed(telephony.snrNumber);

    utils.click(telephony.cancelButton);
    utils.expectIsNotDisplayed(telephony.snrNumber);
    utils.click(telephony.snrSwitch);

    utils.sendKeys(telephony.snrNumber, snrLine);
    utils.click(telephony.saveButton);
    notifications.assertSuccess('Single Number Reach configuration saved successfully');

    utils.clickLastBreadcrumb();
    utils.expectText(telephony.snrStatus, 'On');
  });

  it('should save the disabled state', function () {
    utils.click(telephony.snrFeature);
    utils.expectIsDisplayed(telephony.snrTitle);
    utils.expectSwitchState(telephony.snrSwitch, true);
    utils.expectIsDisplayed(telephony.snrNumber);

    utils.click(telephony.snrSwitch);
    utils.expectIsNotDisplayed(telephony.snrNumber);

    utils.click(telephony.cancelButton);
    utils.expectIsDisplayed(telephony.snrNumber);
    utils.expectValueToBeSet(telephony.snrNumber, snrLine);
    utils.click(telephony.snrSwitch);

    utils.click(telephony.saveButton);
    notifications.assertSuccess('Single Number Reach configuration removed successfully');

    utils.clickLastBreadcrumb();
    utils.expectText(telephony.snrStatus, 'Off');
  });

  afterAll(function () {
    utils.deleteUser(user);
  });
});
