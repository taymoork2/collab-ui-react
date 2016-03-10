'use strict';

/* global inviteusers */
/* global LONG_TIMEOUT */

describe('Manual invite of multiple users', function () {
  var testUser = utils.randomTestGmailwithSalt('manual');
  var testUser2 = utils.randomTestGmailwithSalt('manual');

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  it('should Manually Invite multiple users by email address, .', function () {
    // Select Invite from setup menu
    utils.click(landing.serviceSetup);
    utils.click(navigation.addUsers);
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');

    // Manual import
    utils.click(inviteusers.manualUpload);
    utils.click(inviteusers.nextButton);

    // Enter test email into edit box
    // Note, this should NOT be changed to first/last/email so that we can test both cases
    utils.click(users.emailAddressRadio);
    utils.sendKeys(users.addUsersField, testUser + ', ' + testUser2);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(inviteusers.nextButton);

    // Need a license for valid HS services
    utils.click(users.paidMsgCheckbox);
    utils.click(inviteusers.nextButton);
    notifications.assertSuccess('onboarded successfully');

    activate.setup(null, testUser);
    activate.setup(null, testUser2);
  });

  it('should confirm invited users exist and have licenses/entitlements set.', function () {
    var arUsers = [testUser, testUser2];
    for (var i = 0; i < arUsers.length; i++) {
      utils.searchAndClick(arUsers[i]);
      utils.expectIsDisplayed(users.messageService);
    }
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser);
    deleteUtils.deleteUser(testUser2);
  });
});
