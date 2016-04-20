'use strict';

/* global LONG_TIMEOUT */

describe('Onboard users with Hybrid Services', function () {
  var token;
  var testUser = utils.randomTestGmailwithSalt('hybridservices');

  function expectHybridServices(calendar, callAware, callConnect) {
    utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, calendar);
    utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, callAware);

    // Get into the call service settings, make sure EC is off!
    if (callAware === 'On') {
      utils.click(users.callServiceAware_link);
      utils.expectTextToBeSet(users.callServiceAwareStatus, callAware);
      utils.expectTextToBeSet(users.callServiceConnectStatus, callConnect);
    }
  }

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users')
      .then(function (bearerToken) {
        token = bearerToken;
      });
  });

  it('should ensure services enabled', function () {
    navigation.ensureHybridService(navigation.calendarServicePage);
    navigation.ensureHybridService(navigation.callServicePage);
    navigation.ensureCallServiceAware();
  });

  describe('Onboard user with no hybrid services', function () {
    it('should add user', function () {
      navigation.clickUsers();
      users.createUser(testUser);
      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);
      activate.setup(null, testUser);
    });

    it('should confirm user added and entitled', function () {
      utils.searchAndClick(testUser);
      utils.expectIsDisplayed(users.servicesPanel);

      utils.expectIsNotDisplayed(users.messageService);
      utils.expectIsNotDisplayed(users.meetingService);
      utils.expectIsNotDisplayed(users.hybridServices_sidePanel_Calendar);
      utils.expectIsNotDisplayed(users.hybridServices_sidePanel_UC);

      utils.click(users.closeSidePanel);
      utils.deleteUser(testUser);
    });
  });

  describe('Onboard and test HS additive case', function () {
    it('should add a user (Meeting On, Calendar On)', function () {
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

      utils.expectIsNotDisplayed(users.messageService);
      utils.expectIsDisplayed(users.meetingService);
      expectHybridServices('On', 'Off', 'Off');

      utils.click(users.closeSidePanel);
    });

    it('should re-onboard with more entitlements to confirm the additive case', function () {
      users.createUser(testUser);

      // Select hybrid services
      utils.click(users.hybridServices_UC);

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);

      utils.searchAndClick(testUser);
      utils.expectIsDisplayed(users.servicesPanel);

      utils.expectIsNotDisplayed(users.messageService);
      utils.expectIsDisplayed(users.meetingService);
      expectHybridServices('On', 'On', 'Off');

      utils.click(users.closeSidePanel);
      utils.deleteUser(testUser);
    });
  });

  describe('Onboard user with Call Service Aware', function () {
    it('should add user (Message On, Aware on)', function () {
      users.createUser(testUser);

      utils.click(users.paidMsgCheckbox);
      utils.click(users.hybridServices_UC);

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);

      activate.setup(null, testUser);
    });

    it('should confirm user added and entitled', function () {
      utils.searchAndClick(testUser);
      utils.expectIsDisplayed(users.servicesPanel);

      utils.expectIsDisplayed(users.messageService);
      utils.expectIsNotDisplayed(users.meetingService);
      expectHybridServices('Off', 'On', 'Off');

      utils.click(users.closeSidePanel);
      utils.deleteUser(testUser);
    });
  });

  describe('Onboard user with Call Service Connect', function () {
    it('should add user (Calendar, Aware, and Connect all on)', function () {
      users.createUser(testUser);

      utils.click(users.paidMsgCheckbox);
      utils.click(users.hybridServices_Cal);
      utils.click(users.hybridServices_EC);

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);

      activate.setup(null, testUser);
    });

    it('should confirm user added and entitled', function () {
      utils.searchAndClick(testUser);
      utils.expectIsDisplayed(users.servicesPanel);

      utils.expectIsDisplayed(users.messageService);
      utils.expectIsNotDisplayed(users.meetingService);
      expectHybridServices('On', 'On', 'On');

      utils.click(users.closeSidePanel);
    });
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser, token);
  });
});
