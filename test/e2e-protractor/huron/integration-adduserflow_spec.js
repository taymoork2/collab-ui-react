'use strict';

/* global describe */
/* global it */

var admintestuser= {
  username: 'admin@uc.e2e.huron-alpha.com',
  password: 'C1sco123!'
};

var testuser = {
  username: 'atlasmapservice+ll1@gmail.com',
  password: 'C1sc0123!',
};

// Logging in. Write your tests after the login flow is complete.
xdescribe('Squared UC Add User flow', function() {
  //Add and Entitle User Flows
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

      it('should display only invite and add button', function() {
        expect(users.inviteButton.isDisplayed()).toBeTruthy();
        expect(users.addButton.isDisplayed()).toBeTruthy();
        users.assertEntitlementListSize(4);
      });
    });

    describe('Add a new Squared UC user', function() {
      it('should display input user email in results with success message', function() {
        users.addUsersField.sendKeys(inputEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.squaredUCCheckBox.click();
        users.addButton.click();
        notifications.assertSuccess(inputEmail, 'added successfully');
        users.closeAddUsers.click();
        browser.sleep(3000);
      });
    });

    describe('Verify the created user', function() {
      it('should show the Telephony panel', function() {
        users.search(inputEmail);
        browser.driver.manage().window().maximize();
        users.userListEnts.then(function(cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          users.gridCell.click();
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
      it('should close the preview panel', function() {
        telephony.close.click();
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
        telephony.saveButton.click();
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
        browser.driver.manage().window().maximize();
        users.userListEnts.then(function(cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          users.gridCell.click();
        });
      });
      it('should check Squared UC checkbox and close the preview panel', function(){
        telephony.squaredUCCheckBox.click();
        telephony.saveButton.click();
        telephony.close.click();
      });
      it('should show the Telephony panel', function() {
        users.search(inputEmail);
        browser.driver.manage().window().maximize();
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

    describe('Test Voicemail', function() {
      it('should go to the voicemail detail page and turn voicemail off', function() {
        telephony.voicemailStatus.click();
        expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeTruthy();
        utils.disableSwitch(telephony.voicemailSwitch);
        expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeFalsy();
        telephony.saveVoicemail.click();
        browser.sleep(1000);
        expect(telephony.voicemailStatus.getText()).toEqual('Off');
      });
    });

    describe('Test Single Number Reach', function() {
      it('should go to the SNR detail page and turn SNR on', function() {
        telephony.snrStatus.click();
        expect(utils.getSwitchState(telephony.snrSwitch)).toBeFalsy();
        utils.enableSwitch(telephony.snrSwitch);
        expect(utils.getSwitchState(telephony.snrSwitch)).toBeTruthy();
        telephony.snrNumber.sendKeys('1314');
        telephony.saveSNR.click();
        browser.sleep(1000);
        expect(telephony.snrStatus.getText()).toEqual('On');
      });
    });

    describe('Delete user used for add test', function() {
      it('should delete added user', function() {
       element(by.binding('currentUser.userName')).evaluate('currentUser').then(function(currentUser){
        console.dir(currentUser);
        expect(deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, currentUser.userName)).toEqual(204);
        expect(deleteUtils.deleteUser(inputEmail)).toEqual(200);
        browser.sleep(3000);
       });
      });
    });

    it('should log out', function() {
      navigation.logout();
    });

  });

});
