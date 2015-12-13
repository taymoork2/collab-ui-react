'use strict';
/*jshint loopfunc: true */
/* global describe, it, LONG_TIMEOUT */

describe('Configuring services per-user', function () {
  var testUser = utils.randomTestGmail();

  var file = './../data/DELETE_DO_NOT_CHECKIN_configure_user_service_test_file.csv';
  var absolutePath = utils.resolvePath(file);
  var fileText = 'First Name,Last Name,Display Name,User ID/Email,Directory Number,Direct Line\r\n';

  var i;

  // User array
  var userList = [];
  var numUsers = 101;
  for (i = 0; i < numUsers; i++) {
    userList[i] = utils.randomTestGmailwithSalt('config_user');
    fileText += 'Test,User_' + (1000 + i) + ',Test User,' + userList[i] + ',' + (1000 + i) + ',\r\n';
  }

  // Make file
  utils.writeFile(absolutePath, fileText);

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
    utils.deleteUser(testUser);
  });

  it('should add user with NO hybrid services selected', function () {
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
    utils.deleteUser(testUser);
  });

  it('should add user with ALL hybrid services selected', function () {
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
    utils.deleteUser(testUser);
  });

  ////////////////////////////////////////////////////////////
  // Manual Invite with Hybrid Services
  //
  it('should Manually Invite user', function () {
    // Select Invite from setup menu
    utils.click(landing.serviceSetup);
    utils.click(navigation.addUsers);
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Invite Users');

    // Manual import is default
    utils.click(inviteusers.nextButton);

    // Enter test user name into input box
    utils.sendKeys(users.addUsersField, testUser);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);

    // Enable a hybrid service
    utils.click(users.hybridServices_UC);
    utils.click(inviteusers.finishButton);
    notifications.assertSuccess('onboarded successfully');
  });

  it('should confirm hybrid services set', function () {
    utils.searchAndClick(testUser);
    utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
    utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');
    utils.click(users.closeSidePanel);
    utils.deleteUser(testUser);
  });

  ///////////////////////////////////////////////////////////////
  // CSV Invite with hybrid services (onboard-csv_spec.js uses non-hybrid-service compatible account)
  //
  it('should open CSV import dialog', function () {
    utils.click(landing.serviceSetup);
    utils.click(navigation.addUsers);
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Invite Users');
    utils.wait(inviteusers.submenuCSV);
    utils.click(inviteusers.bulkUpload);
    utils.click(inviteusers.nextButton);
  });

  it('should land to the upload csv section', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Upload CSV');
    utils.fileSendKeys(inviteusers.fileElem, absolutePath);
    utils.expectTextToBeSet(inviteusers.progress, '100%');
    utils.click(inviteusers.nextButton);
  });

  it('should land to assign services section', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Assign Services');
    // Select hybrid services
    utils.click(users.hybridServices_UC);
    utils.click(inviteusers.nextButton);
  });

  it('should land to upload processing page', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Processing CSV');
  });

  it('should land to upload result page', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Upload Result');
    utils.click(inviteusers.finishButton);
  });

  it('should find some of the ' + userList.length + ' users created', function () {
    var ind;
    for (i = 0; i < 3; i++) {
      switch (i) {
      case 0:
        ind = 0; // first
        break;
      case 1:
        ind = (userList.length > 2) ? Math.round(userList.length / 2) : 1; // middle
        break;
      case 2:
        ind = userList.length - 1; // last
        break;
      }

      utils.searchAndClick(userList[ind]);
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');
      utils.click(users.closeSidePanel);
    }
  }, LONG_TIMEOUT);

  ////////////////////////////////////

  afterAll(function () {
    // Delete file
    utils.deleteFile(absolutePath);
    deleteUtils.deleteUser(testUser);
    for (i = 0; i < userList.length; i++) {
      deleteUtils.deleteUser(userList[i]);
    }
  }, 60000 * 4);  // 4 minutes -- give it time to delete the imports
});
