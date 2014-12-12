'use strict';

/* global describe */
/* global it */

var invitetestuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
  usernameWithNoEntitlements: 'collabctg+doNotDeleteTestUser@gmail.com'
};

var testuser = {
  username: 'atlasmapservice+ll1@gmail.com',
  password: 'C1sc0123!',
};


// Logging in. Write your tests after the login flow is complete.
describe('Add/Invite/Entitle User flow', function() {
  describe('Page initialization', function() {
    it('should login as pbr org admin', function(){
      login.login(invitetestuser.username, invitetestuser.password);
    });

    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
    });

    it('click on add button should pop up the adduser modal and display only invite button', function() {
      users.addUsers.click();
      browser.sleep(1000);  //TODO fix this - animation should be resolved by angular
      expect(users.manageDialog.isDisplayed()).toBeTruthy();
      expect(users.inviteButton.isDisplayed()).toBeTruthy();
      expect(users.entitleButton.isPresent()).toBeFalsy();
      expect(users.addButton.isPresent()).toBeFalsy();
    });

    describe('Cancel', function() {
      it('should clear user input field and error message', function() {
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.clearButton.click();
        expect(users.addUsersField.getText()).toBe('');
      });
    });

    describe('Input validation', function() {
      var validinputs = ['user@projectsquared.com', '<user@user.projectsquared>', '"user@user.projectsquared"'];
      var invalidinputs = ['user', '<user@user.com', 'user@user.com>', '"user@user.com', 'user@user.com"'];
      it('should invalidate token with invalid inputs and disable button', function() {
        for (var i = 0; i < invalidinputs.length; i++) {
          users.addUsersField.sendKeys(invalidinputs[i]);
          users.addUsersField.sendKeys(protractor.Key.ENTER);
          expect(users.invalid.isPresent()).toBeTruthy();
          expect(users.inviteButton.isEnabled()).toBeFalsy();
          users.clearButton.click();
        }
      });
      it('should tokenize a valid input and activate button', function() {
        for (var i = 0; i < validinputs.length; i++) {
          users.addUsersField.sendKeys(validinputs[i]);
          users.addUsersField.sendKeys(protractor.Key.ENTER);
          expect(users.invalid.isPresent()).toBeFalsy();
          expect(users.inviteButton.isEnabled()).toBeTruthy();
          users.clearButton.click();
        }
      }, 45000);

    });

    it('should display error if no user is entered on invite', function() {
      users.inviteButton.click();
      notifications.assertError('Please enter valid user email(s).');
    });

    describe('Invite users', function() {
      it('should invite users successfully', function() {
        var inviteEmail = utils.randomTestGmail();
        users.clearButton.click();
        users.addUsersField.sendKeys(inviteEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.inviteButton.click();
        notifications.assertSuccess('sent successfully');
      });

      it('should not invite users successfully if they are already entitled', function() {
        var inviteEmail = invitetestuser.username;
        users.clearButton.click();
        users.addUsersField.sendKeys(inviteEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.inviteButton.click();
        notifications.assertError('already entitled');
      });

      it('should invite users successfully from org which has autoentitlement flag disabled', function() {
        var inviteEmail = invitetestuser.usernameWithNoEntitlements;
        users.clearButton.click();
        users.addUsersField.sendKeys(inviteEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.inviteButton.click();
        notifications.assertSuccess('sent successfully');
      });
    });

    it('clicking on cancel button should close the modal', function() {
      users.closeAddUsers.click();
      browser.sleep(1000);  //TODO fix this - animation should be resolved by angular
      expect(users.manageDialog.isDisplayed()).toBeFalsy();
    });

    it('should log out', function() {
      navigation.logout();
    });
  });

  //Add and Entitle User Flows
  describe('Add and Entitle User Flows', function() {
    var inputEmail = utils.randomTestGmail();
    describe('Login as testuser admin and launch add users modal', function() {
      it('should login as testuser admin', function(){
        login.login(testuser.username, testuser.password);
      });

      it('should open add user modal in users page while clicking on the quick link', function() {
        landing.addUserQuickLink.click();
        navigation.expectCurrentUrl('/users');
        expect(users.manageDialog.isDisplayed()).toBeTruthy();
      });

      it('should display only invite, entitle and add button', function() {
        expect(users.inviteButton.isDisplayed()).toBeTruthy();
        expect(users.entitleButton.isDisplayed()).toBeTruthy();
        expect(users.addButton.isDisplayed()).toBeTruthy();
        users.assertEntitlementListSize(1);
      });
    });

    it('should display error if no user is entered on entitle', function() {
        users.entitleButton.click();
        browser.sleep(1000);
        notifications.assertError('Please enter valid user email(s).');
        notifications.clearNotifications();
      });

    it('should display error if no user is entered on add', function() {
      users.addButton.click();
      browser.sleep(1000);
      notifications.assertError('Please enter valid user email(s).');
      notifications.clearNotifications();
    });

    describe('Add an existing user', function() {
      it('should display input user email in results with already exists message', function() {
        users.clearButton.click();
        users.addUsersField.sendKeys(testuser.username);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.addButton.click();
        notifications.assertError('already exists');
      });
    });

    describe('Add a new user', function() {
      it('should display input user email in results with success message', function() {
        users.clearButton.click();
        users.addUsersField.sendKeys(inputEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.addButton.click();
        notifications.assertSuccess(inputEmail, 'added successfully');
      });
    });

    describe('Entitle an existing user with call-initiation', function() {
      it('should display input user email in results with success message', function() {
        users.clearButton.click();
        users.addUsersField.sendKeys(inputEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.manageCallInitiation.click();
        users.entitleButton.click();
        notifications.assertSuccess(inputEmail, 'entitled successfully');
      });
    });

    describe('Attempt to un-entitle call-initiation', function() {
      it('should display input user email in results with entitlement previously updated message', function() {
        users.clearButton.click();
        users.addUsersField.sendKeys(inputEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.manageCallInitiation.click();
        users.entitleButton.click();
        notifications.assertError(inputEmail, 'entitlement previously updated');
        users.closeAddUsers.click();
        browser.sleep(1000);  //TODO fix this - animation should be resolved by angular
      });
    });

    describe('Verify call-initiation entitlement exists for user and un-entitle', function() {
      it('should show call-initiation entitlement for the user', function() {
        users.search(inputEmail);
        browser.driver.manage().window().maximize();
        users.userListEnts.then(function(cell) {
          expect(cell[0].getText()).toContain(inputEmail);
          users.gridCell.click();
        });
        browser.sleep(3000);  //TODO fix this - animation should be resolved by angular
        expect(users.callInitiationCheckbox.isDisplayed()).toBeTruthy();
        users.callInitiationCheckbox.click();
        browser.sleep(100);
        users.saveButton.click();
        notifications.assertSuccess(inputEmail, 'updated successfully');
      });
    });

    describe('Delete user used for entitle test', function() {
      it('should delete added user', function() {
        expect(deleteUtils.deleteUser(inputEmail)).toEqual(200);
      });
    });

    it('should log out', function() {
      navigation.logout();
    });

  });

});

