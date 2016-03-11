'use strict';

/* global LONG_TIMEOUT */

describe('Configuring services per-user', function () {
  var testUser = utils.randomTestGmailwithSalt('hybridservices');

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  it('should ensure calendar service enabled', function () {
    navigation.ensureHybridService(navigation.calendarServicePage);
  });

  it('should ensure call service enabled', function () {
    navigation.ensureHybridService(navigation.callServicePage);
    navigation.ensureCallServiceAware();
  });

  ///////////////////////////////////////////////////////////////////////////////
  describe('Add user with Calendar service', function () {
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

      utils.expectIsNotDisplayed(users.messageService);
      utils.expectIsDisplayed(users.meetingService);
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'Off');
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
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

      // Get into the call service settings, make sure EC is off!
      utils.click(users.callServiceAware_link);
      utils.expectTextToBeSet(users.callServiceAwareStatus, 'On');
      utils.expectTextToBeSet(users.callServiceConnectStatus, 'Off');

      utils.click(users.closeSidePanel);
      utils.deleteUser(testUser);
    });
  });

  ///////////////////////////////////////////////////////////////////////////////
  describe('User with NO hybrid services', function () {
    it('should add user', function () {
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

  ///////////////////////////////////////////////////////////////////////////////
  describe('User with SOME hybrid services', function () {
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
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

      utils.click(users.callServiceAware_link);
      utils.expectTextToBeSet(users.callServiceAwareStatus, 'On');
      utils.expectTextToBeSet(users.callServiceConnectStatus, 'Off');

      utils.click(users.closeSidePanel);
      utils.deleteUser(testUser);
    });
  });

  /////////////////////////////////////////////////////////////////////////////////
  describe('User with ALL hybrid services', function () {
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
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

      utils.click(users.callServiceAware_link);
      utils.expectTextToBeSet(users.callServiceAwareStatus, 'On');
      utils.expectTextToBeSet(users.callServiceConnectStatus, 'On');

      utils.click(users.closeSidePanel);
      utils.deleteUser(testUser);
    });
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser);
  });
});
