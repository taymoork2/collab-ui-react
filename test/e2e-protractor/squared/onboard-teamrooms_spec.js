'use strict';

/* global LONG_TIMEOUT */

describe('Onboard users with Message service', function () {
  var testUser = utils.randomTestGmailwithSalt('teamrooms');

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  describe('Onboard user', function () {
    it('should add a user (Meeting On, Calendar On)', function () {
      navigation.clickUsers();
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

      utils.expectIsDisplayed(users.meetingService);
      utils.expectIsNotDisplayed(users.messageService);

      utils.click(users.closeSidePanel);
    });

    it('should add Standard Team Rooms', function () {
      utils.searchAndClick(testUser);
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

    it('should confirm hybrid service entitlements retain previous settings', function () {
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'Off');
    });


  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser);
  });
});
