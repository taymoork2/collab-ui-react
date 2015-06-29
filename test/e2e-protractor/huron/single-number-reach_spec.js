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
  var snrLine = telephony.getRandomNumber();

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

  describe('Single Number Reach', function () {

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
  });

  it('should delete added user', function () {
    deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, token);
    deleteUtils.deleteUser(user);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
