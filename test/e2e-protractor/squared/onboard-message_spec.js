'use strict';

var featureToggle = require('../utils/featureToggle.utils');

/* global manageUsersPage */

describe('Onboard users with Message Service', function () {
  var token;
  var testUser = utils.randomTestGmailWithSalt('message');
  var LICENSE = users.paidMsgCheckbox;

  function checkAndClickInterop(curState, targetState) {
    utils.clickUser(testUser);
    utils.click(users.messagingService);
    utils.expectCheckbox(users.messengerInteropCheckbox, curState);

    utils.click(users.messengerInteropCheckbox);
    utils.expectCheckbox(users.messengerInteropCheckbox, targetState);

    utils.click(users.saveButton);
    notifications.assertSuccess(testUser, 'entitlements were updated successfully');

    // re-navigate breacrumb and verify value
    utils.clickFirstBreadcrumb();
    utils.click(users.messagingService);
    utils.expectCheckbox(users.messengerInteropCheckbox, targetState);

    utils.click(users.closeSidePanel);
  }

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users')
      .then(function (bearerToken) {
        token = bearerToken;
      });
  });

  describe('Test manage dialog functionality', function () {
    it('should select manually add/modify users', function () {
      utils.click(navigation.usersTab);
      utils.click(manageUsersPage.buttons.manageUsers);
      utils.waitForText(manageUsersPage.select.title, 'Add or Modify Users');
      utils.click(manageUsersPage.select.radio.orgManual);
      utils.click(manageUsersPage.buttons.next);
      if (featureToggle.features.atlasEmailSuppress) {
        utils.wait(manageUsersPage.emailSuppress.emailSuppressIcon);
        utils.click(manageUsersPage.buttons.next);
      }
      utils.waitForText(manageUsersPage.select.title, 'Manually Add or Modify Users');
    });


    it('should clear user input field and error message', function () {
      utils.sendKeys(users.addUsersField, 'abcdefg' + protractor.Key.ENTER);
      utils.click(users.clearButton);
      utils.waitForText(users.addUsersField, '');
      utils.expectIsDisabled(users.nextButton);
      utils.click(users.close);
      utils.expectIsNotDisplayed(users.manageDialog);
    });
  });

  describe('Onboard user', function () {
    it('should add a user (Message On)', function () {
      // TODO: brspence - revert back to creating user with meeting license after backend fix
      users.createUserWithLicense(testUser);
    });

    it('should check (Message Off) then check', function () {
      users.clickServiceCheckbox(testUser, false, false, LICENSE);
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

    it('should check (Message On) then uncheck', function () {
      users.clickServiceCheckbox(testUser, true, false, LICENSE);
    });

    it('should check (Message Off)', function () {
      users.clickServiceCheckbox(testUser, false, false, LICENSE);
    });
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser, token);
  });
});
