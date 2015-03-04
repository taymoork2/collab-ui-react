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

var hurontestuser = {
  username: 'admin@int1.huron-alpha.com',
  password: 'Cisco123!',
};

var accounttestuser = {
  username: 'nkamboh+acc2@gmail.com',
  password: 'C1sc0123!',
};

describe('Add/Invite/Entitle User flow', function() {
  beforeEach(function() { browser.ignoreSynchronization = true; });
  afterEach(function() { browser.ignoreSynchronization = false; });

  describe('Page initialization', function() {

    it('should login as pbr org admin', function(){
      login.login(invitetestuser.username, invitetestuser.password);
    });

    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
    });

    it('click on add button should pop up the adduser modal and display only invite button', function() {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
      utils.expectIsDisplayed(users.onboardButton);
      utils.expectIsNotDisplayed(users.entitleButton);
      utils.expectIsNotDisplayed(users.addButton);
    });

    describe('Cancel', function() {
      it('should clear user input field and error message', function() {
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.clearButton);
        utils.expectText(users.addUsersField, '');
      });
    });

    it('should display error if no user is entered on invite', function() {
      utils.click(users.onboardButton);
      notifications.assertError('Please enter valid user email(s).');
    });

    describe('Invite users', function() {
      var inviteEmail;
      it('should invite users successfully', function() {
        inviteEmail = utils.randomTestGmail();
        utils.click(users.clearButton);
        users.addUsersField.sendKeys(inviteEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.onboardButton);
        notifications.assertSuccess('sent successfully');
        deleteUtils.deleteUser(inviteEmail);
      });

      it('should not invite users successfully if they are already entitled', function() {
        inviteEmail = invitetestuser.username;
        utils.click(users.clearButton);
        users.addUsersField.sendKeys(inviteEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.onboardButton);
        notifications.assertError('already entitled');
      });

      it('should invite users successfully from org which has autoentitlement flag disabled', function() {
        inviteEmail = invitetestuser.usernameWithNoEntitlements;
        utils.click(users.clearButton);
        users.addUsersField.sendKeys(inviteEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.onboardButton);
        notifications.assertSuccess('sent successfully');
      });

      it('clicking on cancel button should close the modal', function() {
        utils.click(users.closeAddUsers);
        utils.expectIsNotDisplayed(users.manageDialog);
      });

      it('should show active status on new user', function(){
        users.search(inviteEmail);
        utils.expectText(users.userListStatus.first(), 'Invite Pending');
      });

      it('should resend user invitation to pending user', function(){
        utils.click(users.userListAction);
        utils.click(users.resendInviteOption);
        notifications.assertSuccess('Successfully resent invitation');
      });
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
        utils.click(landing.addUserQuickLink);
        navigation.expectCurrentUrl('/users');
        utils.expectIsDisplayed(users.manageDialog);
      });
    });

    it('should display error if no user is entered on entitle', function() {
      utils.click(users.onboardButton);
      notifications.assertError('Please enter valid user email(s).');
      notifications.clearNotifications();
    });

    describe('Add an existing user', function() {
      it('should display input user email in results with already exists message', function() {
        utils.click(users.clearButton);
        users.addUsersField.sendKeys(testuser.username);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.collabRadio1);
        utils.click(users.onboardButton);
        notifications.assertError('already entitled');
        notifications.clearNotifications();
      });
    });

    describe('Add a new user', function() {
      it('should display input user email in results with success message', function() {
        utils.click(users.clearButton);
        users.addUsersField.sendKeys(inputEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.collabRadio1);
        utils.click(users.onboardButton);
        notifications.assertSuccess(inputEmail, 'sent successfully');
        notifications.clearNotifications();
      });
    });

    // TODO: Needs to be fixed.
    // describe('Entitle an existing user with call-initiation', function() {
    //   it('should display input user email in results with success message', function() {
    //     users.clearButton.click();
    //     users.addUsersField.sendKeys(inputEmail);
    //     users.addUsersField.sendKeys(protractor.Key.ENTER);
    //     users.collabRadio1.click();
    //     browser.sleep(1000);
    //     users.manageCallInitiation.click();
    //     users.onboardButton.click();
    //     notifications.assertSuccess(inputEmail, 'sent successfully');
    //     notifications.clearNotifications();
    //   });
    // });

    describe('Attempt to un-entitle call-initiation', function() {
    //   it('should display input user email in results with entitlement updated message', function() {
    //     users.clearButton.click();
    //     users.addUsersField.sendKeys(inputEmail);
    //     users.addUsersField.sendKeys(protractor.Key.ENTER);
    //     users.collabRadio1.click();
    //     browser.sleep(1000);
    //     users.manageCallInitiation.click();
    //     users.onboardButton.click();
    //     notifications.assertSuccess(inputEmail, 'sent successfully');
    //     notifications.clearNotifications();
    //   });

      it('clicking on cancel button should close the modal', function() {
        utils.click(users.closeAddUsers);
        utils.expectIsNotDisplayed(users.manageDialog);
      });
    });

    describe('Verify call-initiation entitlement does not exist for user and re-entitle', function() {
      it('should show call-initiation entitlement for the user', function() {
        users.search(inputEmail);
        utils.expectText(users.userListEnts.first(), inputEmail);
        utils.click(users.gridCell);
        utils.expectIsDisplayed(users.callInitiationCheckbox);
        utils.click(users.callInitiationCheckbox);
        utils.click(users.saveButton);
        notifications.assertSuccess(inputEmail, 'updated successfully');
        notifications.clearNotifications();
      });
    });

    describe('Delete user used for entitle test', function() {
      it('should delete added user', function() {
        deleteUtils.deleteUser(inputEmail);
      });
    });

    it('should log out', function() {
      navigation.logout();
    });

  });

  //log in as huron user
  xdescribe('Page initialization', function() {
    var addEmail = utils.randomTestGmail();

    it('should login as huron admin', function(){
      login.login(hurontestuser.username, hurontestuser.password);
    });

    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
    });

    it('click on add button should pop up the adduser modal and display only invite button', function() {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
      utils.expectIsDisplayed(users.onboardButton);
      utils.expectIsNotDisplayed(users.entitleButton);
      utils.expectIsNotDisplayed(users.addButton);
    });

    describe('Clear', function() {
      it('should clear user input field and error message', function() {
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.clearButton);
        utils.expectText(users.addUsersField, '');
      });
    });

    describe('Add users', function() {
      it('should add users successfully', function() {
        utils.click(users.clearButton);
        users.addUsersField.sendKeys(addEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.collabRadio1);
        utils.click(users.squaredUCCheckBox);
        utils.click(users.onboardButton);
        notifications.assertSuccess(addEmail, 'added successfully');
        notifications.clearNotifications();
      });
      it('clicking on cancel button should close the modal', function() {
        utils.click(users.closeAddUsers);
        utils.expectIsNotDisplayed(users.manageDialog);
      });
    });

    describe('Delete user used for entitle test', function() {
      it('should delete added user', function() {
        expect(deleteUtils.deleteUser(addEmail)).toEqual(200);
      });
    });

    it('should log out', function() {
      navigation.logout();
    });
  });

  //log in as admin with an account
  describe('Page initialization', function() {
    var addEmail = utils.randomTestGmail();

    it('should login as huron admin', function(){
      login.login(accounttestuser.username, accounttestuser.password);
    });

    it('clicking on users tab should change the view', function() {
      navigation.clickUsers();
    });

    it('click on add button should pop up the adduser modal and display only invite button', function() {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });

    describe('check account buckets', function() {
      it('should clear user input field and error message', function() {
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.clearButton);
        utils.expectText(users.addUsersField, '');
      });

      it('click on enable services individually', function() {
        utils.click(users.collabRadio1);
        utils.expectIsDisplayed(users.messageLicenses);
        utils.expectIsDisplayed(users.conferenceLicenses);
        utils.expectIsDisplayed(users.communicationLicenses);
      });
    });

    describe('Add users', function() {
      it('should add users successfully', function() {
        utils.click(users.clearButton);
        users.addUsersField.sendKeys(addEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.collabRadio1);
        utils.click(users.onboardButton);
        notifications.assertSuccess(addEmail, 'sent successfully');
        notifications.clearNotifications();
      });
      it('clicking on cancel button should close the modal', function() {
        utils.click(users.closeAddUsers);
        utils.expectIsNotDisplayed(users.manageDialog);
      });
    });

    describe('Delete user used for entitle test', function() {
      it('should delete added user', function() {
        deleteUtils.deleteUser(addEmail);
      });
    });

    it('should log out', function() {
      navigation.logout();
    });
  });
});

