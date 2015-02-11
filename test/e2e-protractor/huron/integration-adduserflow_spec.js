'use strict';

/* global describe */
/* global it */

var admintestuser= {
  username: 'admin@uc.e2e.huron-alpha.com',
  password: 'C1sco123!'
};

xdescribe('Squared UC Add User flow', function() {
  var currentUser;
  describe('Add and Entitle User Flows', function() {
    var inputEmail = utils.randomTestGmail();
    describe('Login as testuser admin and launch add users modal', function() {
      it('should login as testuser admin', function(){
        login.login(admintestuser.username, admintestuser.password);
      });

      it('clicking on users tab should change the view', function() {
        navigation.clickUsers();
      });

      it('click on add button should pop up the adduser modal', function() {
        users.addUsers.click();
        browser.sleep(1000);
        navigation.expectCurrentUrl('/users');
        expect(users.manageDialog.isDisplayed()).toBeTruthy();
      });
    });

    describe('Add a new Squared UC user', function() {
      it('should display input user email in results with success message', function() {
        users.addUsersField.sendKeys(inputEmail);
        users.collabRadio1.click();
        users.inviteRadio2.click();
        browser.sleep(1000);
        expect(users.onboardButton.isDisplayed()).toBeTruthy();
        users.assertEntitlementListSize(5);
        users.squaredUCCheckBox.click();
        users.onboardButton.click();
        notifications.assertSuccess(inputEmail, 'added successfully');
        users.closeAddUsers.click();
        browser.sleep(3000);
      });
    });

    describe('Verify the created user', function() {
      it('should show the Telephony panel', function() {
        users.search(inputEmail);
        users.returnUser(inputEmail).click();
        element(by.binding('currentUser.userName')).evaluate('currentUser').then(function(_currentUser){
          currentUser = _currentUser;
          expect(currentUser).not.toBeNull();
        });
      });
      it('should have a line/directory number', function() {
        expect(telephony.telephonyPanel.isDisplayed()).toBeTruthy();
        expect(telephony.directoryNumbers.count()).toBe(1);
      });
      it('should have voicemail on', function() {
        expect(telephony.voicemailFeature.isDisplayed()).toBeTruthy();
        expect(telephony.voicemailStatus.getText()).toEqual('On');
      });

      describe('Verify call forwarding defaults', function() {
        it('should show the Line Configuration panel', function() {
          telephony.primaryNumber.click();
          browser.wait(function() {
            return telephony.lineConfigPanel.isPresent().then(function(present) {
              return present;
            })
          });
        });
        it('should have call forwarding default to voicemail', function() {
          expect(telephony.forwardBusyInput.getAttribute('value')).toEqual('Voicemail');
          expect(telephony.forwardNoAnswerInput.getAttribute('value')).toEqual('Voicemail');
        });
        it('should close the Line Configuration panel', function() {
          telephony.closeLineConfig.click();
        });
      });

    });

    describe('To remove Squared UC from the user', function() {
      it('should show the Telephony panel', function() {
        users.search(inputEmail);
        users.userListEnts.then(function(cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          users.gridCell.click();
        });
      });
      it('should uncheck Squared UC checkbox', function(){
        telephony.squaredUCCheckBox.click();
        telephony.saveEntitlements.click();
        notifications.assertSuccess('entitlements were updated successfully');
      });
      it('should not have line or voicemail visible', function() {
        expect(telephony.telephonyPanel.isDisplayed()).toBeFalsy();
        expect(telephony.voicemailFeature.isDisplayed()).toBeFalsy();
      });
      it('should close the preview panel', function() {
        telephony.close.click();
      });
    });

    describe('To entitle Squared UC to the user again', function() {
      it('should show the Telephony panel', function() {
        users.search(inputEmail);
        users.userListEnts.then(function(cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          users.gridCell.click();
        });
      });
      it('should check Squared UC checkbox and close the preview panel', function(){
        telephony.squaredUCCheckBox.click();
        telephony.saveEntitlements.click();
        notifications.assertSuccess('entitlements were updated successfully');
        telephony.close.click();
      });
      it('should show the Telephony panel', function() {
        users.search(inputEmail);
        users.userListEnts.then(function(cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          users.gridCell.click();
        });
      });
      it('should have a line/directory number again', function() {
        expect(telephony.telephonyPanel.isDisplayed()).toBeTruthy();
        expect(telephony.directoryNumbers.count()).toBe(1);
      });
      it('should have voicemail on', function() {
        expect(telephony.voicemailFeature.isDisplayed()).toBeTruthy();
        expect(telephony.voicemailStatus.getText()).toEqual('On');
      });
    });

    describe('Delete user used for add test', function() {
      it('should delete added user', function() {
        expect(deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, currentUser.userName)).toEqual(204);
        expect(deleteUtils.deleteUser(inputEmail)).toEqual(200);
      });
    });

    it('should log out', function() {
      navigation.logout();
    });

  });

});
