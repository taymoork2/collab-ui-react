'use strict';

/* global inviteusers */
/* global LONG_TIMEOUT */

describe('Onboard Users using uploading CSV File', function () {

  var file = './../data/DELETE_DO_NOT_CHECKIN_onboard_csv_test_file.csv';
  var absolutePath = utils.resolvePath(file);
  var fileText = 'First Name,Last Name,Display Name,User ID/Email,Directory Number,Direct Line\r\n';

  var i;
  var numUsers = 4;

  // User array
  var userList = [];
  for (i = 0; i < numUsers; i++) {
    userList[i] = utils.randomTestGmailwithSalt('CSV');
    fileText += 'Test,User_' + (1000 + i) + ',Test User,' + userList[i] + ',' + (1000 + i) + ',\r\n';
  }

  // Make file
  utils.writeFile(absolutePath, fileText);

  beforeAll(function () {
    login.login('test-user', '#/users');
  }, 120000);

  it('should open add users tab', function () {
    navigation.clickAddUsers();
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
    utils.click(inviteusers.bulkUpload);
    utils.click(inviteusers.nextButton);
  });

  it('should land to the upload csv section', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
    utils.fileSendKeys(inviteusers.fileElem, absolutePath);
    utils.expectTextToBeSet(inviteusers.progress, '100%');
    utils.click(inviteusers.nextButton);
  });

  it('should land to assign services section', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
    utils.click(inviteusers.nextButton);
  });

  it('should land to upload processing page', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
  });

  it('should land to upload result page', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
    utils.click(inviteusers.finishButton);
  });

  it('should find all ' + userList.length + ' users created', function () {
    for (i = 0; i < userList.length; i++) {
      utils.search(userList[i]);
    }
  }, LONG_TIMEOUT);

  afterAll(function () {
    // Delete file
    utils.deleteFile(absolutePath);

    for (i = 0; i < userList.length; i++) {
      deleteUtils.deleteUser(userList[i]);
    }
  }, LONG_TIMEOUT);

});
