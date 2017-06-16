'use strict';

describe('Voicemail', function () {

  var user = utils.randomTestGmail();

  beforeAll(function () {
    utils.loginAndCreateHuronUser('huron-int1', user);
  }, 120000);

  it('should open the communcations panel', function () {
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
  });

  it('should cancel saving the disabled state', function () {
    utils.waitForText(telephony.voicemailStatus, 'On');
    utils.click(telephony.voicemailFeature);
    utils.expectSwitchState(telephony.voicemailSwitch, true);
    utils.expectIsDisplayed(telephony.voicemailTitle);

    utils.expectIsNotDisplayed(telephony.voicemailCancel);
    utils.expectIsNotDisplayed(telephony.voicemailSave);

    utils.click(telephony.voicemailSwitch);
    utils.click(telephony.voicemailSave);
    utils.expectIsDisplayed(telephony.disableVoicemailtitle);
    utils.click(telephony.disableVoicemailCancel);
    utils.expectIsNotDisplayed(telephony.disableVoicemailtitle);
  });

  it('should save the disabled state', function () {
    utils.expectSwitchState(telephony.voicemailSwitch, true);
    utils.click(telephony.voicemailSwitch);
    utils.click(telephony.voicemailSave);
    utils.click(telephony.disableVoicemailSave);

    notifications.assertSuccess('Voicemail configuration saved successfully');
    utils.expectSwitchState(telephony.voicemailSwitch, false);

    utils.clickLastBreadcrumb();
    utils.waitForText(telephony.voicemailStatus, 'Off');
  });

  it('should cancel saving the enabled state', function () {
    utils.click(telephony.voicemailFeature);
    utils.expectSwitchState(telephony.voicemailSwitch, false);
    utils.expectIsDisplayed(telephony.voicemailTitle);

    utils.expectIsNotDisplayed(telephony.voicemailCancel);
    utils.expectIsNotDisplayed(telephony.voicemailSave);

    utils.click(telephony.voicemailSwitch);
    utils.expectIsDisplayed(telephony.voicemailCancel);
    utils.expectIsDisplayed(telephony.voicemailSave);

    utils.click(telephony.voicemailCancel);
    utils.expectIsNotDisplayed(telephony.voicemailCancel);
    utils.expectIsNotDisplayed(telephony.voicemailSave);
  });

  it('should save the enabled state', function () {
    utils.expectSwitchState(telephony.voicemailSwitch, false);
    utils.click(telephony.voicemailSwitch);
    utils.click(telephony.voicemailSave);

    notifications.assertSuccess('Voicemail configuration saved successfully');
    utils.expectSwitchState(telephony.voicemailSwitch, true);

    utils.clickLastBreadcrumb();
    utils.waitForText(telephony.voicemailStatus, 'On');
  });

  afterAll(function () {
    utils.deleteUser(user);
  });

});
