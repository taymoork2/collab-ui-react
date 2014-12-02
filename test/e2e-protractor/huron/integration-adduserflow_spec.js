'use strict';

/* global describe */
/* global it */

var admintestuser= {
  username: 'admin@int1.huron-alpha.com',
  password: 'Cisco123!',
  usernameWithNoEntitlements: 'doNotDeleteTestUser@wx2.example.com'
};

var testuser = {
  username: 'atlasmapservice+ll1@gmail.com',
  password: 'C1sc0123!',
};

// Logging in. Write your tests after the login flow is complete.
xdescribe('Squared UC Add User flow', function() {
  //Add and Entitle User Flows
  describe('Add and Entitle User Flows', function() {
    var inputEmail = utils.randomTestEmail();
    describe('Login as testuser admin and launch add users modal', function() {
      it('should login as testuser admin', function(){
        login.login(admintestuser.username, admintestuser.password);
      });

      it('clicking on users tab should change the view', function() {
        navigation.clickUsers();
      });

      it('click on add button should pop up the adduser modal', function() {
        users.addUsers.click();
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

    describe('Verify user exists and has a line and voicemail is on', function() {
      it('should show the Telephony panel and the user should have a line and voicemail is on', function() {
        users.search(inputEmail);
        browser.driver.manage().window().maximize();
        users.userListEnts.then(function(cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          users.gridCell.click();
        });
        expect(telephony.telephonyPanel.isDisplayed()).toBeTruthy();
        expect(telephony.directoryNumbers.count()).toBe(1);
        expect(telephony.voicemailFeature.isDisplayed()).toBeTruthy();
        expect(telephony.voicemailStatus.getText()).toEqual('On');
        //telephony.close.click();
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

