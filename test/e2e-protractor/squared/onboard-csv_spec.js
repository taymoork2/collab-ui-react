'use strict';

/* global inviteusers */
/* global LONG_TIMEOUT */

describe('Onboard Users using uploading CSV File', function () {
  var fileToUpload = './../data/sample-squared.csv';
  var absolutePath = utils.resolvePath(fileToUpload);

  var i;

  // User array
  var userList = [];
  for (i = 0; i < 5; i++) {
    userList[i] = 'collabctg+csvImportTestUser500' + (i + 1) + '@gmail.com';
  }

  beforeAll(function () {
    login.login('test-user', '#/users');
  }, 120000);

  it('should open invite users tab', function () {
    navigation.clickAddUsers();
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
    utils.click(inviteusers.nextButton);
  });

  it('should land to upload processing page', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Processing CSV');
  });

  it('should land to upload result page', function () {
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Upload Result');
    utils.click(inviteusers.finishButton);
  });

  it('should find all ' + userList.length + ' users created', function () {
    for (i = 0; i < userList.length; i++) {
      utils.searchForSingleResult(userList[i]);
    }
  }, LONG_TIMEOUT); // increase time for 5 users

  afterAll(function () {
    for (i = 0; i < userList.length; i++) {
      deleteUtils.deleteUser(userList[i]);
    }
  }, LONG_TIMEOUT);

});
