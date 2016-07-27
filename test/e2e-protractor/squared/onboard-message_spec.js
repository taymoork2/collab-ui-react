'use strict';

/* global LONG_TIMEOUT */

describe('Onboard users with Message Service', function () {
  var token;
  var testUser = utils.randomTestGmailwithSalt('meetings');
  var LICENSE = users.paidMsgCheckbox;

  function checkAndClickInterop(curState, targetState) {
    utils.clickUser(testUser);
    utils.click(users.messagingService);
    utils.expectCheckbox(users.messengerInteropCheckbox, curState);

    utils.click(users.messengerInteropCheckbox);
    utils.expectCheckbox(users.messengerInteropCheckbox, targetState);

    utils.click(users.saveButton);
    notifications.assertSuccess(testUser, 'entitlements were updated successfully');
    utils.click(users.closeSidePanel);
  }

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users')
      .then(function (bearerToken) {
        token = bearerToken;
      });
  });

  describe('Test manage dialog functionality', function () {
    it('click on add button should pop up the adduser modal and display only invite button', function () {
      navigation.clickUsers();
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });

    it('should clear user input field and error message', function () {
      utils.sendKeys(users.addUsersField, 'abcdefg' + protractor.Key.ENTER);
      utils.click(users.clearButton);
      utils.expectTextToBeSet(users.addUsersField, '');
      utils.expectIsDisabled(users.nextButton);
      utils.click(users.close);
      utils.expectIsNotDisplayed(users.manageDialog);
    });
  });

  describe('Onboard user', function () {
    it('should add a user (Message On)', function () {
      users.createUserWithLicense(testUser, LICENSE);
    });

    it('should re-enable the Messenger interop entitlement', function () {
      checkAndClickInterop(false, true);
    });

    it('should verify that the Messenger interop entitlement was re-enabled', function () {
      utils.clickUser(testUser);
      utils.click(users.messagingService);
      utils.expectCheckbox(users.messengerInteropCheckbox, true);
      utils.click(users.closeSidePanel);
    });

    xit('should check (Message On) then uncheck', function () {
      users.clickServiceCheckbox(testUser, true, false, LICENSE);
    });

    xit('should check (Message Off) then check', function () {
      users.clickServiceCheckbox(testUser, false, false, LICENSE);
    });

    xit('should check (Message On)', function () {
      users.clickServiceCheckbox(testUser, true, false, LICENSE);
    });
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser, token);
  });
});
