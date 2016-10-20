'use strict';

/* global manageUsersPage xafterAll */
/* global LONG_TIMEOUT */

// NOTE: Be sure to re-enable the afterAll at line 151 when re-enabling this test!
xdescribe('Manage Users - CSV File -', function () {
  var token;
  var CSV_FILE_NAME = 'DELETE_DO_NOT_CHECKIN_onboard_csv_test_file.csv';
  var CSV_FILE_PATH = utils.resolvePath('./../data/' + CSV_FILE_NAME);
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
    login.login('account-admin', '#/users')
      .then(function (_token) {
        token = _token;
      });
  });

  it('should select bulk upload/modify users', function () {
    utils.click(navigation.usersTab);
    utils.click(manageUsersPage.buttons.manageUsers);
    utils.expectTextToBeSet(manageUsersPage.select.title, 'Add or Modify Users');
    utils.click(manageUsersPage.select.radio.orgBulk);
    utils.click(manageUsersPage.buttons.next);
    utils.expectTextToBeSet(manageUsersPage.bulk.title, 'Bulk Add or Modify Users');
  });

  describe('Export CSV', function () {

    it('should download CSV Template', function () {

      utils.expectIsDisplayed(manageUsersPage.bulk.export.downloadTemplateButton);
      utils.click(manageUsersPage.bulk.export.downloadTemplateButton);
      utils.expectIsDisplayed(manageUsersPage.bulk.export.exportSpinner);
      utils.expectIsDisplayed(manageUsersPage.bulk.export.cancelExportButton);
      utils.waitForModal().then(function () {
        notifications.assertSuccess('Your template list has been compiled and your download has started.');
      });

    });

    it('should NOT export Users to CSV file when export canceled', function () {

      utils.expectIsDisplayed(manageUsersPage.bulk.export.exportCsvButton);
      utils.click(manageUsersPage.bulk.export.exportCsvButton);

      utils.waitForModal().then(function () {
        utils.expectTextToBeSet(manageUsersPage.modalDialog.title, 'Export User Attributes');
        utils.click(manageUsersPage.modalDialog.cancelButton);

        utils.expectIsNotDisplayed(manageUsersPage.bulk.export.exportSpinner);
        utils.expectIsNotDisplayed(manageUsersPage.bulk.export.cancelExportButton);
      });
    });

    it('should export Users to CSV file when export selected', function () {

      utils.expectIsDisplayed(manageUsersPage.bulk.export.exportCsvButton);
      utils.click(manageUsersPage.bulk.export.exportCsvButton);

      utils.waitForModal().then(function () {
        utils.expectTextToBeSet(manageUsersPage.modalDialog.title, 'Export User Attributes');
        utils.click(manageUsersPage.modalDialog.exportButton);

        utils.expectIsDisplayed(manageUsersPage.bulk.export.exportSpinner);
        utils.expectIsDisplayed(manageUsersPage.bulk.export.cancelExportButton);

        utils.waitForModal().then(function () {
          notifications.assertSuccess('Your user list has been compiled and your download has started.');
        });

      });
    }, 60000 * 4);

  });

  describe('Import CSV', function () {

    it('should cancel file to upload', function () {

      utils.fileSendKeys(manageUsersPage.bulk.import.uploadInput, CSV_FILE_PATH);

      utils.expectTextToBeSet(manageUsersPage.bulk.import.importFileName, CSV_FILE_NAME);
      utils.expectIsDisplayed(manageUsersPage.bulk.import.removeFileButton);
      utils.expectIsDisplayed(manageUsersPage.bulk.import.addServicesOnlyRadio);
      utils.expectIsDisplayed(manageUsersPage.bulk.import.addAdnRemoveServicesRadio);

      utils.click(manageUsersPage.bulk.import.removeFileButton);
      utils.expectIsNotDisplayed(manageUsersPage.bulk.import.removeFileButton);
      utils.expectIsNotDisplayed(manageUsersPage.bulk.import.addServicesOnlyRadio);
      utils.expectIsNotDisplayed(manageUsersPage.bulk.import.addAdnRemoveServicesRadio);

    });

    it('should set file to upload and import CSV', function () {

      utils.fileSendKeys(manageUsersPage.bulk.import.uploadInput, CSV_FILE_PATH);

      utils.expectTextToBeSet(manageUsersPage.bulk.import.importFileName, CSV_FILE_NAME);
      utils.expectIsDisplayed(manageUsersPage.bulk.import.removeFileButton);
      utils.expectIsDisplayed(manageUsersPage.bulk.import.addServicesOnlyRadio);
      utils.expectIsDisplayed(manageUsersPage.bulk.import.addAdnRemoveServicesRadio);

      utils.click(manageUsersPage.bulk.import.addServicesOnlyRadio);

      utils.click(manageUsersPage.buttons.submit);

      // status screen should now be displayed
      utils.expectIsDisplayed(manageUsersPage.importStatus.statusDisplay);
      utils.expectTextToBeSet(manageUsersPage.importStatus.progressFileName, CSV_FILE_NAME);

      // import complete.  check our results
      utils.waitForPresence(manageUsersPage.importStatus.uploadComplete);
      utils.expectTextToBeSet(manageUsersPage.importStatus.uploadComplete, 'Completed ' + CSV_FILE_NAME + ' at');

      utils.expectTextToBeSet(manageUsersPage.importStatus.newUsers, '' + userList.length);
      utils.expectTextToBeSet(manageUsersPage.importStatus.updatedUsers, '0');
      utils.expectTextToBeSet(manageUsersPage.importStatus.errorUsers, '0');

      utils.click(manageUsersPage.buttons.done);
    });

    it('should confirm first user onboarded', function () {
      confirmUserOnboarded(userList[0]);
    });

    it('should confirm middle user onboarded', function () {
      confirmUserOnboarded(userList[(userList.length > 2) ? Math.round(userList.length / 2) : 1]);
    });

    it('should confirm last user onboarded', function () {
      confirmUserOnboarded(userList[userList.length - 1]);
    });

    xafterAll(function () {
      utils.deleteFile(CSV_FILE_PATH);
      _.each(userList, function (user) {
        deleteUtils.deleteUser(user, token);
      });
    }, 60000 * 4);
  });

});

