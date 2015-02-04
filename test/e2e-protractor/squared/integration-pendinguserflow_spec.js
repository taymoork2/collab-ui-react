'use strict';

var invitetestuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!'
};

var testuser = {
  username: 'atlasmapservice+ll1@gmail.com',
  password: 'C1sc0123!',
};

describe('Add/Invite/Entitle User flow', function() {
  var inviteEmail;
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
      expect(users.onboardButton.isDisplayed()).toBeTruthy();
    });

    describe('Invite users', function() {
      it('should invite users successfully', function() {
        inviteEmail = utils.randomTestGmail();
        //users.clearButton.click();
        users.addUsersField.sendKeys(inviteEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        users.onboardButton.click();
        notifications.assertSuccess('sent successfully');
      });

      it('clicking on cancel button should close the modal', function() {
        users.closeAddUsers.click();
        browser.sleep(1000);  //TODO fix this - animation should be resolved by angular
        expect(users.manageDialog.isDisplayed()).toBeFalsy();
      });
    });

    describe('Check new users status and resend invitattion', function(){
      it('should show active status on new user', function(){
        users.search(inviteEmail);
        browser.sleep(2000);
        users.userListStatus.then(function(newcell) {
            expect(newcell[0].getText()).toContain('Invite Pending');
          });
      });
      it('should resend user invitation to pending user', function(){
        utils.click(users.userListAction);

        utils.click(users.resendInviteOption);

        notifications.assertSuccess('Successfully resent invitation');

      });
    });

    describe('Delete user used for entitle test', function() {
      it('should delete added user', function() {
        expect(deleteUtils.deleteUser(inviteEmail)).toEqual(200);
      });
    });

    it('should log out', function() {
      navigation.logout();
    });
  });
});