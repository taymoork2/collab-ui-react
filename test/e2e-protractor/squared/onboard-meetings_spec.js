'use strict';

/* global LONG_TIMEOUT */

describe('Configuring services per-user', function () {
  var testUser = utils.randomTestGmailwithSalt('meetings');

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  describe('User with 25 party meetings', function () {
    it('should add a user (Meeting On)', function () {
      users.createUser(testUser);
      utils.click(users.paidMtgCheckbox);
      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);

      activate.setup(null, testUser);
    });

    it('should confirm user added and entitled', function () {
      utils.searchAndClick(testUser);
      utils.expectIsDisplayed(users.servicesPanel);

      utils.expectIsNotDisplayed(users.messageService);
      utils.expectIsDisplayed(users.meetingService);
      utils.click(users.closeSidePanel);
      utils.deleteUser(testUser);
    });
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser);
  });
});
