'use strict';

/* global LONG_TIMEOUT */

describe('Onboard users with Meeting Service', function () {
  var testUser = utils.randomTestGmailwithSalt('meetings');

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  describe('Onboard user', function () {
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
    });

    it('should check (Message On, Meeting On) then uncheck them', function () {
      utils.clickUser(testUser);
      utils.expectIsDisplayed(users.servicesPanel);

      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
      utils.waitForModal().then(function () {
        utils.expectCheckbox(users.paidMsgCheckbox, false);
        utils.expectCheckbox(users.paidMtgCheckbox, true);

        // Uncheck licenses...
        utils.click(users.paidMtgCheckbox);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
        utils.click(users.closeSidePanel);
      });
    });

    it('should check (Message Off, Meeting Off)', function () {
      utils.clickUser(testUser);
      utils.expectIsDisplayed(users.servicesPanel);
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);

      utils.waitForModal().then(function () {
        utils.expectCheckbox(users.paidMsgCheckbox, false);
        utils.expectCheckbox(users.paidMtgCheckbox, false);
        utils.click(users.cancelButton);
        utils.expectIsNotDisplayed(users.manageDialog);
        utils.click(users.closeSidePanel);
      });
    });
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser);
  });
});
