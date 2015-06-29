'use strict';

describe('Telephony Info', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  var currentUser, token;
  var user = utils.randomTestGmail();

  it('should login', function () {
    login.login('huron-int1');
  });

  it('should retrieve a token', function (done) {
    utils.retrieveToken().then(function (_token) {
      token = _token;
      done();
    });
  });

  it('clicking on users tab should change the view', function () {
    navigation.clickUsers();
  });

  it('should create user', function () {
    utils.click(users.addUsers);
    utils.click(users.addUsersField);
    utils.sendKeys(users.addUsersField, user);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);
    utils.click(users.advancedCommunications);
    utils.click(users.onboardButton);
    notifications.assertSuccess(user, 'onboarded successfully');
    utils.click(users.closeAddUsers);

  });

  it('should verify added user', function (done) {
    utils.searchAndClick(user).then(function () {
      users.retrieveCurrentUser().then(function (_currentUser) {
        currentUser = _currentUser;
        done();
      });
    });
  });

  it('should open the communcations panel', function () {
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
  });

  describe('Voicemail', function () {

    it('should cancel saving the disabled state', function () {
      utils.expectText(telephony.voicemailStatus, 'On');
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
      utils.expectText(telephony.voicemailStatus, 'Off');
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
      utils.expectText(telephony.voicemailStatus, 'On');
    });
  });

  it('should delete added user', function () {
    deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, token);
    deleteUtils.deleteUser(user);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
