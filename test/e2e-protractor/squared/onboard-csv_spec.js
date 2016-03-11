'use strict';

/* global inviteusers */
/* global LONG_TIMEOUT */

describe('Onboard Users using CSV File', function () {
  var file = './../data/DELETE_DO_NOT_CHECKIN_onboard_csv_test_file.csv';
  var absolutePath = utils.resolvePath(file);
  var fileText = 'First Name,Last Name,Display Name,User ID/Email (Required),Calendar Service,Call Service Aware,Meeting 25 Party,Spark Message\r\n';

  var i;
  var importUsers = false;

  // User array
  var userList = [];
  var numUsers = 25; // batch size is 10
  for (i = 0; i < numUsers; i++) {
    userList[i] = utils.randomTestGmailwithSalt('CSV');
    fileText += 'Test,User_' + (1000 + i) + ',Test User,' + userList[i] + ',f,t,t,f\r\n';
  }

  // Make file for import CSV testing
  utils.writeFile(absolutePath, fileText);

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  it('should open add users tab', function () {
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
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
    utils.fileSendKeys(inviteusers.fileElem, absolutePath);
    importUsers = true; // Optimize whether we clean these users up
    utils.expectTextToBeSet(inviteusers.progress, '100%');
    utils.click(inviteusers.nextButton);
  });

  it('should land to upload processing page', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
  });

  it('should land to upload result page', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
    utils.click(inviteusers.finishButton);
  }, LONG_TIMEOUT);

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
      utils.expectIsDisplayed(users.servicesPanel);

      utils.expectIsNotDisplayed(users.messageService);
      utils.expectIsDisplayed(users.meetingService);
      utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
      utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

      utils.click(users.closeSidePanel);
    }
  }, LONG_TIMEOUT);

  afterAll(function () {
    // Delete file
    utils.deleteFile(absolutePath);

    // Delete users if they were successfully imported
    if (importUsers) {
      for (i = 0; i < userList.length; i++) {
        deleteUtils.deleteUser(userList[i]);
      }
    }
  }, 60000 * 4);
});
