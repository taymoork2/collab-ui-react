'use strict';

/* global inviteusers */
/* global LONG_TIMEOUT */

describe('Onboard users through Manual Invite', function () {
  var userList = [utils.randomTestGmailwithSalt('manual'), utils.randomTestGmailwithSalt('manual')];

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  it('should Manually Invite multiple users by email address (Message On).', function () {
    // Select Invite from setup menu
    utils.click(landing.serviceSetup);
    utils.click(navigation.addUsers);
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');

    // Manual import
    utils.click(inviteusers.manualUpload);
    utils.click(inviteusers.nextButton);

    // Enter test email into edit box
    utils.click(users.emailAddressRadio);
    utils.sendKeys(users.addUsersField, userList[0] + ', ' + userList[1]);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(inviteusers.nextButton);

    // Need a license for valid HS services
    utils.click(users.paidMsgCheckbox);
    utils.click(inviteusers.nextButton);
    notifications.assertSuccess('onboarded successfully');

    _.each(userList, function (alias) {
      activate.setup(null, alias);
    });
  });

  it('should confirm invited users exist and have licenses/entitlements set.', function () {
    _.each(userList, function (alias) {
      utils.searchAndClick(alias);
      utils.expectIsDisplayed(users.servicesPanel);

      utils.expectIsDisplayed(users.messageService);
      utils.expectIsNotDisplayed(users.meetingService);
      utils.click(users.closeSidePanel);
    });
  });

  afterAll(function () {
    _.each(userList, deleteUtils.deleteUser);
  });
});
