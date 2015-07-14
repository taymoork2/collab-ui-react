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
    utils.sendKeys(users.addUsersField, testUser);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);
    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
  });

  it('clicking on cancel button should close the modal', function () {
    utils.expectIsNotDisplayed(users.manageDialog);
  });

  it('should add standard team rooms service', function () {
    utils.searchAndClick(testUser);
    utils.click(users.servicesActionButton);
    utils.click(users.editServicesButton);
    utils.click(users.standardTeamRooms);
    utils.expectCheckbox(users.standardTeamRooms, true);
    utils.click(users.saveButton);
    notifications.assertSuccess('entitled successfully');
  });

  it('should disable the Messenger interop entitlement', function () {
    utils.searchAndClick(testUser);
    utils.click(users.messagingService);
    utils.expectCheckbox(users.messengerInteropCheckbox, true);
    utils.click(users.messengerInteropCheckbox);
    utils.expectCheckbox(users.messengerInteropCheckbox, false);
    utils.click(users.saveButton);
    notifications.assertSuccess(testUser, 'entitlements were updated successfully');
    utils.click(users.closeSidePanel);
  });

  it('should re-enable the Messenger interop entitlement', function () {
    utils.searchAndClick(testUser);
    utils.click(users.messagingService);
    utils.expectCheckbox(users.messengerInteropCheckbox, false);
    utils.click(users.messengerInteropCheckbox);
    utils.expectCheckbox(users.messengerInteropCheckbox, true);
    utils.click(users.saveButton);
    notifications.assertSuccess(testUser, 'entitlements were updated successfully');
    utils.click(users.closeSidePanel);
  });

  it('should verify that the Messenger interop entitlement was re-enabled', function () {
    utils.searchAndClick(testUser);
    utils.click(users.messagingService);
    utils.expectCheckbox(users.messengerInteropCheckbox, true);
  });

  it('should delete added user', function () {
    deleteUtils.deleteUser(testUser);
  });

});
