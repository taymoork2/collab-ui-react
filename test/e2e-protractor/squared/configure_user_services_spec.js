'use strict';

/* global LONG_TIMEOUT */

describe('Configuring services per-user', function () {
  var testUser = utils.randomTestGmailwithSalt('config_solo');
  var testUser2 = utils.randomTestGmailwithSalt('config_solo');

  var file = './../data/DELETE_DO_NOT_CHECKIN_configure_user_service_test_file.csv';
  var absolutePath = utils.resolvePath(file);
  var fileText = 'First Name,Last Name,Display Name,User ID/Email (Required),Calendar Service,Call Service Aware,Meeting 25 Party,Spark Message\r\n';

  var i;
  var bImportUsers = false;

  // User array
  var userList = [];
  var numUsers = 10 * 3; // batch size is 10
  for (i = 0; i < numUsers; i++) {
    userList[i] = utils.randomTestGmailwithSalt('config_user');
    fileText += 'Test,User_' + (1000 + i) + ',Test User,' + userList[i] + ',f,t,t,f\r\n';
  }

  // Make file for import CSV testing
  utils.writeFile(absolutePath, fileText);

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

  it('should ensure calendar service enabled', function () {
    navigation.ensureHybridService(navigation.calendarServicePage);
  });

  it('should ensure call service enabled', function () {
    navigation.ensureHybridService(navigation.callServicePage);
    navigation.ensureCallServiceAware();
  });

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

    utils.searchAndClick(testUser);
    utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
    utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'Off');
    utils.click(users.closeSidePanel);
  });

  it('should confirm hybrid services ADDITIVE case', function () {
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
    utils.expectCSToggle(users.callServiceAwareToggle, true);
    utils.expectCSToggle(users.callServiceConnectToggle, false);

    utils.click(users.closeSidePanel);
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

      // Confirm these retain their previous settings
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

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

  //////////////////////////////////////
  // 25 party messaging tests
  //
  it('should add a user with 25 party meetings checked', function () {
    users.createUser(testUser);
    utils.click(users.paidMtgCheckbox);
    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
    utils.expectIsNotDisplayed(users.manageDialog);

    activate.setup(null, testUser);

    utils.clickUser(testUser);
    utils.expectIsDisplayed(users.meetingService);
    utils.click(users.closeSidePanel);
    utils.deleteUser(testUser);
  });

  //////////////////////////////////////
  // NO hybrid services
  //
  it('should add user with NO license for hybrid services', function () {
    users.createUser(testUser);

    // we do not check anything during onboarding so no license for this user

    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
    utils.expectIsNotDisplayed(users.manageDialog);

    activate.setup(null, testUser);

    utils.searchAndClick(testUser);
    utils.expectIsNotDisplayed(users.hybridServices_sidePanel_Calendar);
    utils.expectIsNotDisplayed(users.hybridServices_sidePanel_UC);
    utils.click(users.closeSidePanel);
    utils.deleteUser(testUser);
  });

  ///////////////////////////////////////////
  // ALL hybrid services
  //
  it('should add user with ALL hybrid services selected', function () {
    users.createUser(testUser);

    // Need a license for valid HS services
    utils.click(users.paidMsgCheckbox);

    // Select hybrid services
    utils.click(users.hybridServices_Cal);
    utils.click(users.hybridServices_UC);

    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
    utils.expectIsNotDisplayed(users.manageDialog);

    activate.setup(null, testUser);

    utils.searchAndClick(testUser);
    utils.expectIsDisplayed(users.messageService);
    utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
    utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');
    utils.click(users.closeSidePanel);
    utils.deleteUser(testUser);
  });

  ////////////////////////////////////////////////////////////
  // Manual Invite with Hybrid Services
  //
  it('should Manually Add user, set some licenses, set some HS entitlements, onboard the user, verify the user, click the user, check that the licenses and entitlments have been set, close the sidebar, delete the user.', function () {
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

    // Enable a hybrid service
    utils.click(users.hybridServices_EC);
    utils.click(inviteusers.nextButton);
    notifications.assertSuccess('onboarded successfully');

    activate.setup(null, testUser);
    activate.setup(null, testUser2);
  });

  it('should check Manually Added User(s) have licenses and entitlments properly set, then delete users.', function () {
    var arUsers = [testUser, testUser2];
    for (var i = 0; i < arUsers.length; i++) {
      utils.searchAndClick(arUsers[i]);
      utils.expectIsDisplayed(users.messageService);
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

      // Get into the call service settings
      utils.click(users.callServiceAware_link);
      utils.expectCSToggle(users.callServiceAwareToggle, true);
      utils.expectCSToggle(users.callServiceConnectToggle, true);

      utils.click(users.closeSidePanel);

      // Cleanup
      utils.deleteUser(arUsers[i]);
    }
  });

  ///////////////////////////////////////////////////////////////
  // CSV Invite with hybrid services (onboard-csv_spec.js uses non-hybrid-service compatible account)
  //
  it('should open CSV import dialog', function () {
    utils.click(landing.serviceSetup);
    utils.click(navigation.addUsers);
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
    utils.click(inviteusers.bulkUpload);
    utils.click(inviteusers.nextButton);
  });

  it('should land to the download template section', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
    utils.click(inviteusers.nextButton);
  });

  it('should land to the upload csv section', function () {
    utils.fileSendKeys(inviteusers.fileElem, absolutePath);
    bImportUsers = true; // Optimize whether we clean these users up
    utils.expectTextToBeSet(inviteusers.progress, '100%');
    utils.click(inviteusers.nextButton);
  });

  it('should click finish button', function () {
    utils.click(inviteusers.finishButton);
  }, 60000 * 2 + 5000);

  it('should find some of the ' + userList.length + ' users created', function () {
    var nInd;
    for (i = 0; i < 3; i++) {
      switch (i) {
      case 0:
        nInd = 0; // first
        break;
      case 1:
        nInd = (userList.length > 2) ? Math.round(userList.length / 2) : 1; // middle
        break;
      case 2:
        nInd = userList.length - 1; // last
        break;
      }

      activate.setup(null, userList[nInd]);

      utils.searchAndClick(userList[nInd]);
      utils.expectIsDisplayed(users.meetingService);
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
    deleteUtils.deleteUser(testUser2);

    if (bImportUsers) {
      for (i = 0; i < userList.length; i++) {
        deleteUtils.deleteUser(userList[i], true);
      }
    }
  }, 60000 * 4); // 4 minutes -- give it time to delete the imports
});
