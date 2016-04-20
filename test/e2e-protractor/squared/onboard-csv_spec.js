'use strict';

/* global inviteusers */
/* global LONG_TIMEOUT */

describe('Onboard Users using CSV File', function () {
  var CSV_FILE_PATH = utils.resolvePath('./../data/DELETE_DO_NOT_CHECKIN_onboard_csv_test_file.csv');
  var userList = users.createCsvAndReturnUsers(CSV_FILE_PATH);

  // Given an email alias, activate the user and confirm entitlements set
  function confirmUserOnboarded(email) {
    activate.setup(null, email);

    utils.searchAndClick(email);
    utils.expectIsDisplayed(users.servicesPanel);

    utils.expectIsNotDisplayed(users.messageService);
    utils.expectIsDisplayed(users.meetingService);
    utils.expectTextToBeSet(users.hybridServices_sidePanel_Calendar, 'Off');
    utils.expectTextToBeSet(users.hybridServices_sidePanel_UC, 'On');

    utils.click(users.closeSidePanel);
  }

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
    utils.fileSendKeys(inviteusers.fileElem, CSV_FILE_PATH);
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

  it('should confirm first user onboarded', function () {
    confirmUserOnboarded(userList[0]);
  });

  it('should confirm middle user onboarded', function () {
    confirmUserOnboarded(userList[(userList.length > 2) ? Math.round(userList.length / 2) : 1]);
  });

  it('should confirm last user onboarded', function () {
    confirmUserOnboarded(userList[userList.length - 1]);
  });

  afterAll(function () {
    utils.deleteFile(CSV_FILE_PATH);
    _.each(userList, deleteUtils.deleteUser);
  }, 60000 * 4);
});
