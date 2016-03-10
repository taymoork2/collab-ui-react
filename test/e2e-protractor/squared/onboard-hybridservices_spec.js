'use strict';

/* global LONG_TIMEOUT */

describe('Configuring services per-user', function () {
  var testUser = utils.randomTestGmailwithSalt('hybridservices');

  function deleteTestUser() {
    deleteUtils.deleteUser(testUser);
  }

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
    it('should add a user and select hybrid services', function () {
      navigation.clickUsers();
      users.createUser(testUser);

      // Must select license for HS to work
      utils.click(users.paidMtgCheckbox);

      // Select hybrid services
      utils.click(users.hybridServices_Cal);

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);

      activate.setup(null, testUser);
    });

    it('should confirm user added and entitled', function() {
      utils.searchAndClick(testUser);
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
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

      // Get into the call service settings, make sure EC is off!
      utils.click(users.callServiceAware_link);
      utils.expectTextToBeSet(users.callServiceAwareStatus, 'On');
      utils.expectTextToBeSet(users.callServiceConnectStatus, 'Off');

      utils.click(users.closeSidePanel);
    });

    afterAll(deleteTestUser);
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

    it('should confirm user added and entitled', function() {
      utils.searchAndClick(testUser);
      utils.expectIsNotDisplayed(users.hybridServices_sidePanel_Calendar);
      utils.expectIsNotDisplayed(users.hybridServices_sidePanel_UC);
      utils.click(users.closeSidePanel);
    });

    afterAll(deleteTestUser);
  });

  ///////////////////////////////////////////////////////////////////////////////
  describe('User with SOME hybrid services', function () {
    it('should add user (Calender off, Aware on)', function () {
      users.createUser(testUser);

      // Need a license for valid HS services
      utils.click(users.paidMsgCheckbox);

      // Select hybrid services
      utils.click(users.hybridServices_UC);

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);

      activate.setup(null, testUser);
    });

    it('should confirm user added and entitled', function() {
      utils.searchAndClick(testUser);
      utils.expectIsDisplayed(users.messageService);
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

      utils.click(users.callServiceAware_link);
      utils.expectTextToBeSet(users.callServiceAwareStatus, 'On');
      utils.expectTextToBeSet(users.callServiceConnectStatus, 'Off');

      utils.click(users.closeSidePanel);
    });

    afterAll(deleteTestUser);
  });

  /////////////////////////////////////////////////////////////////////////////////
  describe('User with ALL hybrid services', function () {
    it('should add user (Calendar, Aware, and Connect all on)', function () {
      users.createUser(testUser);

      // Need a license for valid HS services
      utils.click(users.paidMsgCheckbox);

      // Select hybrid services
      utils.click(users.hybridServices_Cal);
      utils.click(users.hybridServices_EC);

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);

      activate.setup(null, testUser);
    });

    it('should confirm user added and entitled', function() {
      utils.searchAndClick(testUser);
      utils.expectIsDisplayed(users.messageService);
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

      utils.click(users.callServiceAware_link);
      utils.expectTextToBeSet(users.callServiceAwareStatus, 'On');
      utils.expectTextToBeSet(users.callServiceConnectStatus, 'On');

      utils.click(users.closeSidePanel);
    });

    afterAll(deleteTestUser);
  });
});
