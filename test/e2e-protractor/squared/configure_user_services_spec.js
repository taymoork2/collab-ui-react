'use strict';

/* global LONG_TIMEOUT */

describe('Configuring services per-user', function () {
  var testUser = utils.randomTestGmailwithSalt('config_solo');

  var file = './../data/DELETE_DO_NOT_CHECKIN_configure_user_service_test_file.csv';
  var absolutePath = utils.resolvePath(file);
  var fileText = 'First Name,Last Name,Display Name,User ID/Email,Directory Number,Direct Line\r\n';

  var i;
  var bImportUsers = false;

  // User array
  var userList = [];
  var numUsers = 10 * 3; // batch size is 10
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
    users.createUser(testUser);

    // Select hybrid services
    utils.click(users.hybridServices_Cal);

    utils.click(users.onboardButton);
    notifications.assertSuccess('onboarded successfully');
    utils.expectIsNotDisplayed(users.manageDialog);
  });

  //TODO: re-enable, disabled to patch hideExpressions issue
  //it('should confirm hybrid services case', function () {
  //utils.search(testUser);
  //users.clickOnUser();
  //utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
  //utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'Off');
  //utils.click(users.closeSidePanel);
  //});

  // it('should confirm hybrid services ADDITIVE case', function () {
  //   users.createUser(testUser);

  //   // Select hybrid services
  //   utils.click(users.hybridServices_UC);

  //   utils.click(users.onboardButton);
  //   notifications.assertSuccess('onboarded successfully');
  //   utils.expectIsNotDisplayed(users.manageDialog);

  //   utils.search(testUser);
  //   users.clickOnUser();
  //   utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
  //   utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');
  // });

  // it('should add standard team rooms service', function () {
  //   utils.click(users.servicesActionButton);
  //   utils.click(users.editServicesButton);
  //   utils.waitForModal().then(function () {
  //     utils.expectIsDisplayed(users.editServicesModal);
  //     utils.click(users.standardTeamRooms);
  //     utils.expectCheckbox(users.standardTeamRooms, true);
  //     utils.click(users.saveButton);
  //     /* $TODO - note these hybrid settings should be preserved, but are not (existing $BUG)
  //     utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
  //     utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');
  //     */
  //     notifications.assertSuccess('entitled successfully');
  //   });
  // });

  // it('should disable the Messenger interop entitlement', function () {
  //   users.clickOnUser();
  //   utils.click(users.messagingService);
  //   utils.expectCheckbox(users.messengerInteropCheckbox, true);
  //   utils.click(users.messengerInteropCheckbox);
  //   utils.expectCheckbox(users.messengerInteropCheckbox, false);
  //   utils.click(users.saveButton);
  //   notifications.assertSuccess(testUser, 'entitlements were updated successfully');
  //   utils.click(users.closeSidePanel);
  // });

  // it('should re-enable the Messenger interop entitlement', function () {
  //   users.clickOnUser();
  //   utils.click(users.messagingService);
  //   utils.expectCheckbox(users.messengerInteropCheckbox, false);
  //   utils.click(users.messengerInteropCheckbox);
  //   utils.expectCheckbox(users.messengerInteropCheckbox, true);
  //   utils.click(users.saveButton);
  //   notifications.assertSuccess(testUser, 'entitlements were updated successfully');
  //   utils.click(users.closeSidePanel);
  // });

  // it('should verify that the Messenger interop entitlement was re-enabled', function () {
  //   users.clickOnUser();
  //   utils.click(users.messagingService);
  //   utils.expectCheckbox(users.messengerInteropCheckbox, true);
  //   utils.click(users.closeSidePanel);
  //   utils.deleteUser(testUser);
  // });

  // it('should add user with NO hybrid services selected', function () {
  //   users.createUser(testUser);

  //   utils.click(users.onboardButton);
  //   notifications.assertSuccess('onboarded successfully');
  //   utils.expectIsNotDisplayed(users.manageDialog);

  //   utils.search(testUser);
  //   users.clickOnUser();
  //   utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
  //   utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'Off');
  //   utils.click(users.closeSidePanel);
  //   utils.deleteUser(testUser);
  // });

  // it('should add user with ALL hybrid services selected', function () {
  //   users.createUser(testUser);

  //   // Select hybrid services
  //   utils.click(users.hybridServices_Cal);
  //   utils.click(users.hybridServices_UC);

  //   utils.click(users.onboardButton);
  //   notifications.assertSuccess('onboarded successfully');
  //   utils.expectIsNotDisplayed(users.manageDialog);

  //   utils.search(testUser);
  //   users.clickOnUser();
  //   utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'On');
  //   utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');
  //   utils.click(users.closeSidePanel);
  //   utils.deleteUser(testUser);
  // });

  // ////////////////////////////////////////////////////////////
  // // Manual Invite with Hybrid Services
  // //
  // it('should Manually Invite user', function () {
  //   // Select Invite from setup menu
  //   utils.click(landing.serviceSetup);
  //   utils.click(navigation.addUsers);
  //   utils.expectTextToBeSet(wizard.mainviewTitle, 'Invite Users');

  //   // Manual import
  //   utils.click(inviteusers.manualUpload);
  //   utils.click(inviteusers.nextButton);

  //   // Enter test email into edit box
  //   // Note, this should NOT be changed to first/last/email so that we can test both cases
  //   utils.click(users.emailAddressRadio);
  //   utils.sendKeys(users.addUsersField, testUser);
  //   utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
  //   utils.click(inviteusers.nextButton);

  //   // Enable a hybrid service
  //   utils.click(users.hybridServices_UC);
  //   utils.click(inviteusers.nextButton);
  //   notifications.assertSuccess('onboarded successfully');
  // });

  // it('should confirm hybrid services set', function () {
  //   utils.search(testUser);
  //   users.clickOnUser();
  //   utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
  //   utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');
  //   utils.click(users.closeSidePanel);
  //   utils.deleteUser(testUser);
  // });

  // ///////////////////////////////////////////////////////////////
  // // CSV Invite with hybrid services (onboard-csv_spec.js uses non-hybrid-service compatible account)
  // //
  // it('should open CSV import dialog', function () {
  //   utils.click(landing.serviceSetup);
  //   utils.click(navigation.addUsers);
  //   utils.expectTextToBeSet(wizard.mainviewTitle, 'Invite Users');
  //   utils.click(inviteusers.bulkUpload);
  //   utils.click(inviteusers.nextButton);
  // });

  // it('should land to the upload csv section', function () {
  //   utils.expectTextToBeSet(wizard.mainviewTitle, 'Upload CSV');
  //   utils.fileSendKeys(inviteusers.fileElem, absolutePath);
  //   bImportUsers = true; // Optimize whether we clean these users up
  //   utils.expectTextToBeSet(inviteusers.progress, '100%');
  //   utils.click(inviteusers.nextButton);
  // });

  // it('should land to assign services section', function () {
  //   utils.expectTextToBeSet(wizard.mainviewTitle, 'Assign Services');
  //   // Select hybrid services
  //   utils.click(users.hybridServices_UC);
  //   utils.click(inviteusers.nextButton);
  // });

  // it('should land to upload processing page', function () {
  //   utils.expectTextToBeSet(wizard.mainviewTitle, 'Processing CSV');
  // }, 60000 * 2);

  // it('should land to upload result page', function () {
  //   utils.expectTextToBeSet(wizard.mainviewTitle, 'Upload Result', 60000 * 2);
  //   utils.click(inviteusers.finishButton);
  // }, 60000 * 2 + 5000);

  // it('should find some of the ' + userList.length + ' users created', function () {
  //   var nInd;
  //   for (i = 0; i < 3; i++) {
  //     switch (i) {
  //     case 0:
  //       nInd = 0; // first
  //       break;
  //     case 1:
  //       nInd = (userList.length > 2) ? Math.round(userList.length / 2) : 1; // middle
  //       break;
  //     case 2:
  //       nInd = userList.length - 1; // last
  //       break;
  //     }
  //     utils.search(userList[nInd]);
  //     users.clickOnUser();
  //     utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
  //     utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');
  //     utils.click(users.closeSidePanel);
  //   }
  // }, LONG_TIMEOUT);

  ////////////////////////////////////

  afterAll(function () {
    // Delete file
    utils.deleteFile(absolutePath);
    deleteUtils.deleteUser(testUser);

    if (bImportUsers) {
      for (i = 0; i < userList.length; i++) {
        deleteUtils.deleteUser(userList[i], true);
      }
    }
  }, 60000 * 4); // 4 minutes -- give it time to delete the imports
});
