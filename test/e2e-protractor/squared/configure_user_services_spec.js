'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */

describe('Configuring services per-user', function () {
  var testUser = utils.randomTestGmail();

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  it('should add a user', function () {
    utils.click(users.addUsers);
    utils.expectIsDisplayed(users.manageDialog);
    utils.sendKeys(users.addUsersField, testUser);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);
    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
    utils.expectIsNotDisplayed(users.manageDialog);
  });

  it('should search for user', function () {
    utils.searchAndClick(testUser);
  });

  it('should add standard team rooms service', function () {
    utils.click(users.servicesActionButton);
    utils.click(users.editServicesButton);
    utils.waitForModal().then(function () {
      utils.expectIsDisplayed(users.editServicesModal);
      utils.click(users.standardTeamRooms);
      utils.expectCheckbox(users.standardTeamRooms, true);
      utils.click(users.saveButton);
      notifications.assertSuccess('entitled successfully');
    });
  });

  it('should disable the Messenger interop entitlement', function () {
    utils.clickUser(testUser);
    utils.click(users.messagingService);
    utils.expectCheckbox(users.messengerInteropCheckbox, true);
    utils.click(users.messengerInteropCheckbox);
    utils.expectCheckbox(users.messengerInteropCheckbox, false);
    utils.click(users.saveButton);
    notifications.assertSuccess(testUser, 'entitlements were updated successfully');
    utils.click(users.closeSidePanel);
  });

  it('should re-enable the Messenger interop entitlement', function () {
    utils.clickUser(testUser);
    utils.click(users.messagingService);
    utils.expectCheckbox(users.messengerInteropCheckbox, false);
    utils.click(users.messengerInteropCheckbox);
    utils.expectCheckbox(users.messengerInteropCheckbox, true);
    utils.click(users.saveButton);
    notifications.assertSuccess(testUser, 'entitlements were updated successfully');
    utils.click(users.closeSidePanel);
  });

  it('should verify that the Messenger interop entitlement was re-enabled', function () {
    utils.clickUser(testUser);
    utils.click(users.messagingService);
    utils.expectCheckbox(users.messengerInteropCheckbox, true);
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser);
  });

});
