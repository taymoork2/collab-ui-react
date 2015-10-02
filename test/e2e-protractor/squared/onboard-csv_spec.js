'use strict';

describe('Onboard Users using uploading CSV File', function () {
  var fileToUpload = './../data/sample-squared.csv';
  var absolutePath = utils.resolvePath(fileToUpload);
  var user = 'collabctg+234298675@gmail.com';
  beforeAll(function () {
    login.login('test-user', '#/users');
  }, 120000);

  it('should open invite users tab', function () {
    navigation.clickAddUsers();
    utils.click(inviteusers.bulkUpload);
    utils.expectTextToBeSet(wizard.mainviewTitle, 'Invite Users');
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
  });
  it('search for the user if he is created', function () {
    utils.click(inviteusers.finishButton);
    utils.searchAndClick(user);
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.closeSidePanel);
  });

  afterAll(function () {
    utils.deleteUser(user);
  });

});
