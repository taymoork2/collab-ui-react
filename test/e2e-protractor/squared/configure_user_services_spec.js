'use strict';
/*jshint loopfunc: true */
/* global describe, it */

describe('Configuring services per-user', function () {
  var testUser = utils.randomTestGmail();

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
  });

  it('should add a user and select hybrid services', function () {
    navigation.clickUsers();
    utils.click(users.addUsers);
    utils.expectIsDisplayed(users.manageDialog);
    utils.sendKeys(users.addUsersField, testUser);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);

    // Select hybrid services
    utils.click(users.hybridServices_Cal);

    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
    utils.expectIsNotDisplayed(users.manageDialog);
  });

  it('should confirm hybrid services set', function () {
    utils.searchAndClick(testUser);
    utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
    utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'Off');
  });

  it('should add standard team rooms service', function () {
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

  it('should disable the Messenger interop entitlement', function () {
    utils.clickUser(testUser);
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
  });

  it('should add user with NO hybrid services selected', function () {
    navigation.clickUsers();
    utils.deleteUser(testUser);

    utils.click(users.addUsers);
    utils.expectIsDisplayed(users.manageDialog);
    utils.sendKeys(users.addUsersField, testUser);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);

    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
    utils.expectIsNotDisplayed(users.manageDialog);

    utils.searchAndClick(testUser);
    utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
    utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'Off');
    utils.click(users.closeSidePanel);
  });

  it('should add user with ALL hybrid services selected', function () {
    navigation.clickUsers();
    utils.deleteUser(testUser);

    utils.click(users.addUsers);
    utils.expectIsDisplayed(users.manageDialog);
    utils.sendKeys(users.addUsersField, testUser);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);

    // Select hybrid services
    utils.click(users.hybridServices_Cal);
    utils.click(users.hybridServices_UC);

    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
    utils.expectIsNotDisplayed(users.manageDialog);

    utils.searchAndClick(testUser);
    utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
    utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');
    utils.click(users.closeSidePanel);
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser);
  });

});
