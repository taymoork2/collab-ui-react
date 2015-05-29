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
        utils.click(users.squaredUCCheckBox);
        utils.click(users.onboardButton);
        notifications.assertSuccess(inputEmail, 'onboarded successfully');
        utils.click(users.closeAddUsers);
      });

      it('should verify the created user', function (done) {
        utils.searchAndClick(inputEmail);
        users.retrieveCurrentUser().then(function (_currentUser) {
          currentUser = _currentUser;
          done();
        });
      });
    });

    describe('Verify communcation defaults', function () {
      it('should show the Communication panel', function () {
        utils.click(users.communicationsService);
        utils.expectIsDisplayed(telephony.communicationPanel);
      });
      it('should have a line/directory number', function () {
        utils.expectCount(telephony.directoryNumbers, 1);
      });
      xit('should have voicemail off', function () {
        utils.expectIsDisplayed(telephony.voicemailFeature);
        utils.expectText(telephony.voicemailStatus, 'Off');
      });
      it('should not have voicemail if org doesn\'t have voicemail', function () {
        utils.expectIsNotDisplayed(telephony.voicemailFeature);
      });

      describe('Verify call forwarding defaults', function () {
        it('should show the Line Configuration panel', function () {
          utils.click(telephony.directoryNumbers.first());
          utils.expectIsDisplayed(telephony.lineConfigurationPanel);
        });
        it('should have call forwarding default to none', function () {
          utils.expectIsNotDisplayed(telephony.forwardAll);
          utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
        });
        it('should navigate back to overview panel', function () {
          utils.clickFirstBreadcrumb();
        });
      });
    });

    describe('To remove Squared UC from the user', function () {
      it('should uncheck Squared UC checkbox', function () {
        utils.click(users.messagingService);
        utils.click(telephony.squaredUCCheckBox);
        utils.click(telephony.saveEntitlements);
        notifications.assertSuccess('entitlements were updated successfully');
      });
      it('should not have communications visible', function () {
        utils.clickLastBreadcrumb();
        utils.expectIsNotDisplayed(users.communicationsService);
      });
    });

    describe('To entitle Squared UC to the user again', function () {
      it('should check Squared UC checkbox and close the preview panel', function () {
        utils.click(users.messagingService);
        utils.click(telephony.squaredUCCheckBox);
        utils.click(telephony.saveEntitlements);
        notifications.assertSuccess('entitlements were updated successfully');
      });
      it('should show the Communications service', function () {
        utils.clickLastBreadcrumb();
        utils.expectIsDisplayed(users.communicationsService);
      });
      it('should have a line/directory number again', function () {
        utils.click(users.communicationsService);
        utils.expectIsDisplayed(telephony.communicationPanel);
        utils.expectCount(telephony.directoryNumbers, 1);
      });
      xit('should have voicemail off', function () {
        utils.expectIsDisplayed(telephony.voicemailFeature);
        utils.expectText(telephony.voicemailStatus, 'Off');
      });
      it('should not have voicemail if org doesn\'t have voicemail', function () {
        utils.expectIsNotDisplayed(telephony.voicemailFeature);
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
