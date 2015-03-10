'use strict';

/* global describe */
/* global it */

xdescribe('Squared UC Add User flow', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  var currentUser;
  describe('Add and Entitle User Flows', function () {
    var inputEmail = utils.randomTestGmail();
    describe('Login as testuser admin and launch add users modal', function () {
      it('should login as testuser admin', function () {
        login.login('huron-int1');
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
        users.addUsersField.sendKeys(inputEmail);
        utils.click(users.collabRadio1);
        // utils.click(users.inviteRadio2);

        utils.expectIsDisplayed(users.onboardButton);
        users.assertEntitlementListSize(5);
        utils.click(users.squaredUCCheckBox);
        utils.click(users.onboardButton);
        notifications.assertSuccess(inputEmail, 'added successfully');
        utils.click(users.closeAddUsers);

      });
    });

    describe('Verify the created user', function () {
      it('should show the Telephony panel', function () {
        utils.searchAndClick(inputEmail);
        element(by.binding('currentUser.userName')).evaluate('currentUser').then(function (_currentUser) {
          currentUser = _currentUser;
          expect(currentUser).not.toBeNull();
        });
      });
      it('should have a line/directory number', function () {
        utils.expectIsDisplayed(telephony.telephonyPanel);
        expect(telephony.directoryNumbers.count()).toBe(1);
      });
      it('should have voicemail on', function () {
        utils.expectIsDisplayed(telephony.voicemailFeature);
        utils.expectText(telephony.voicemailStatus, 'On');
      });

      describe('Verify call forwarding defaults', function () {
        it('should show the Line Configuration panel', function () {
          utils.click(telephony.primaryNumber);
          browser.wait(function () {
            return telephony.lineConfigPanel.isPresent().then(function (present) {
              return present;
            });
          });
        });
        it('should have call forwarding default to voicemail', function () {
          expect(telephony.forwardBusyNoAnswerInput.getAttribute('value')).toEqual('Voicemail');
        });
        it('should close the Line Configuration panel', function () {
          utils.click(telephony.closeLineConfig);
        });
      });

    });

    describe('To remove Squared UC from the user', function () {
      it('should show the Telephony panel', function () {
        utils.search(inputEmail);
        users.userListEnts.then(function (cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          utils.click(users.gridCell);
        });
      });
      it('should uncheck Squared UC checkbox', function () {
        utils.click(telephony.squaredUCCheckBox);
        utils.click(telephony.saveEntitlements);
        notifications.assertSuccess('entitlements were updated successfully');
      });
      it('should not have line or voicemail visible', function () {
        utils.expectIsNotDisplayed(telephony.telephonyPanel);
        utils.expectIsNotDisplayed(telephony.voicemailFeature);
      });
      it('should close the preview panel', function () {
        utils.click(telephony.close);
      });
    });

    describe('To entitle Squared UC to the user again', function () {
      it('should show the Telephony panel', function () {
        utils.search(inputEmail);
        users.userListEnts.then(function (cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          utils.click(users.gridCell);
        });
      });
      it('should check Squared UC checkbox and close the preview panel', function () {
        utils.click(telephony.squaredUCCheckBox);
        utils.click(telephony.saveEntitlements);
        notifications.assertSuccess('entitlements were updated successfully');
        utils.click(telephony.close);
      });
      it('should show the Telephony panel', function () {
        utils.search(inputEmail);
        users.userListEnts.then(function (cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          utils.click(users.gridCell);
        });
      });
      it('should have a line/directory number again', function () {
        utils.expectIsDisplayed(telephony.telephonyPanel);
        expect(telephony.directoryNumbers.count()).toBe(1);
      });
      it('should have voicemail on', function () {
        utils.expectIsDisplayed(telephony.voicemailFeature);
        utils.expectText(telephony.voicemailStatus, 'On');
      });
    });

    describe('Delete user used for add test', function () {
      it('should delete added user', function () {
        expect(deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, currentUser.userName)).toEqual(204);
        expect(deleteUtils.deleteUser(inputEmail)).toEqual(200);
      });
    });

    it('should log out', function () {
      navigation.logout();
    });

  });

});
