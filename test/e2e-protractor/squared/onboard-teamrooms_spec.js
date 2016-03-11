'use strict';

/* global LONG_TIMEOUT */

describe('Configuring services per-user', function () {
  var testUser = utils.randomTestGmailwithSalt('teamrooms');

  beforeEach(function () {
    log.verbose = true;
  });

  afterEach(function () {
    log.verbose = false;
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  describe('Onboard user and added services to it', function () {
    it('should add a user (Meeting On, Calendar On)', function () {
      navigation.clickUsers();
      users.createUser(testUser);

      utils.click(users.paidMtgCheckbox);
      utils.click(users.hybridServices_Cal);

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
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'Off');

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

    it('should disable the Messenger interop entitlement', function () {
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
      utils.click(users.closeSidePanel);
      utils.deleteUser(testUser);
    });
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser);
  });
});
