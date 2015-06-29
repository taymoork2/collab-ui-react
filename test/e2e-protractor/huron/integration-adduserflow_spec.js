'use strict';

/* global describe */
/* global it */

describe('Squared UC Add User flow', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  var dropdownVariables = {
    'voicemail': 'Voicemail',
    'addNew': 'Add New'
  };

  var currentUser;
  describe('Add and Entitle User Flows', function () {
    var inputEmail = utils.randomTestGmail();
    var token;
    describe('Login as testuser admin and launch add users modal', function () {
      it('should login as testuser admin', function () {
        login.login('huron-int1');
      });

      it('should retrieve a token', function (done) {
        utils.retrieveToken().then(function (_token) {
          token = _token;
          done();
        });
      });

      it('clicking on users tab should change the view', function () {
        navigation.clickUsers();
      });

      it('click on add button should pop up the adduser modal', function () {
        utils.click(users.addUsers);

        navigation.expectCurrentUrl('/users');
        utils.expectIsDisplayed(users.manageDialog);
      });
    });

    describe('Add a new Squared UC user', function () {
      it('should display input user email in results with success message', function () {
        utils.sendKeys(users.addUsersField, inputEmail);
        utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
        utils.click(users.nextButton);
        utils.click(users.advancedCommunications);
        utils.click(users.onboardButton);
        notifications.assertSuccess(inputEmail, 'onboarded successfully');
        utils.click(users.closeAddUsers);
      });

      it('should verify the created user', function (done) {
        utils.searchAndClick(inputEmail).then(function () {
          return users.retrieveCurrentUser().then(function (_currentUser) {
            currentUser = _currentUser;
            done();
          });
        });
      });
    });

    describe('Verify communcation defaults', function () {
      it('should show the Communication panel', function () {
        utils.expectIsDisplayed(users.rolesChevron);
        utils.click(users.communicationsService);
        utils.expectIsDisplayed(telephony.communicationPanel);
      });
      it('should have a line/directory number', function () {
        utils.expectIsDisplayed(telephony.directoryNumbers.first());
        utils.expectCount(telephony.directoryNumbers, 1);
      });
      it('should have voicemail on', function () {
        utils.expectIsDisplayed(telephony.voicemailFeature);
        utils.expectText(telephony.voicemailStatus, 'On');
      });

      describe('Verify call forwarding defaults', function () {
        it('should show the Line Configuration panel', function () {
          utils.click(telephony.directoryNumbers.first());
          utils.expectIsDisplayed(telephony.lineConfigurationPanel);
        });
        it('should have call forwarding default to none', function () {
          utils.expectIsNotDisplayed(telephony.forwardAll);
          utils.expectInputValue(telephony.forwardBusyNoAnswer, dropdownVariables.voicemail);
          utils.expectIsNotDisplayed(telephony.forwardExternalBusyNoAnswer);
        });
        it('should navigate back to overview panel', function () {
          utils.clickFirstBreadcrumb();
        });
      });
    });

    describe('To remove Squared UC from the user', function () {
      it('should uncheck Squared UC checkbox', function () {
        utils.click(users.servicesActionButton);
        utils.click(users.editServicesButton);
        utils.click(users.advancedCommunications);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
      });
      it('should not have communications visible', function () {
        utils.clickUser(inputEmail);
        utils.expectIsDisplayed(users.servicesPanel);
        utils.expectIsNotDisplayed(users.communicationsService);
      });
    });

    describe('To entitle Squared UC to the user again', function () {
      it('should check Squared UC checkbox and close the preview panel', function () {
        utils.click(users.servicesActionButton);
        utils.click(users.editServicesButton);
        utils.click(users.advancedCommunications);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
      });
      it('should show the Communications service', function () {
        utils.clickUser(inputEmail);
        utils.expectIsDisplayed(users.servicesPanel);
        utils.expectIsDisplayed(users.communicationsService);
      });
      it('should have a line/directory number again', function () {
        utils.click(users.communicationsService);
        utils.expectIsDisplayed(telephony.communicationPanel);
        utils.expectIsDisplayed(telephony.directoryNumbers.first());
        utils.expectCount(telephony.directoryNumbers, 1);
      });
      it('should have voicemail on', function () {
        utils.expectIsDisplayed(telephony.voicemailFeature);
        utils.expectText(telephony.voicemailStatus, 'On');
      });
    });

    describe('Delete user used for add test', function () {
      it('should delete added user', function () {
        deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, token);
        deleteUtils.deleteUser(inputEmail);
      });
    });

    it('should log out', function () {
      navigation.logout();
    });

  });

});
