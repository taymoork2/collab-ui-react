'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('Squared Invite User Flow', function () {

  var inviteEmail;

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors();
  });

  describe('Display invite dialog', function () {
    it('should login as pbr org admin', function () {
      login.login('pbr-admin');
    });

    it('clicking on users tab should change the view', function () {
      navigation.clickUsers();
    });

    it('click on add button should pop up the adduser modal and display only invite button', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
      utils.expectIsDisplayed(users.onboardButton);
      utils.expectIsNotDisplayed(users.entitleButton);
      utils.expectIsNotDisplayed(users.addButton);
    });
  });

  describe('Invite users', function () {
    //TODO disabled due to backend consumer error
    xit('should invite users successfully', function () {
      inviteEmail = utils.randomTestGmail();
      utils.click(users.clearButton);
      utils.sendKeys(users.addUsersField, inviteEmail);
      utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
    });

    xit('clicking on cancel button should close the modal', function () {
      utils.click(users.closeAddUsers);
      utils.expectIsNotDisplayed(users.manageDialog);
    });

    xit('should show call-initiation entitlement for the user', function () {

      utils.search(inviteEmail);
      utils.expectText(users.userListEnts.first(), inviteEmail);
      users.clickOnUser();
      utils.click(users.messagingService);
      utils.click(users.callInitiationCheckbox);
      utils.click(users.saveButton);
      notifications.assertSuccess(inviteEmail, 'updated successfully');
      utils.click(users.closeSidePanel);
    });

    xit('should delete randon user', function () {
      deleteUtils.deleteUser(inviteEmail);
    });

    xit('click on add button should pop up the adduser modal and display only invite button', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });

    it('should not invite users successfully if they are already entitled', function () {
      inviteEmail = users.inviteTestUser.username;
      utils.click(users.clearButton);
      utils.sendKeys(users.addUsersField, inviteEmail);
      utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
      utils.click(users.onboardButton);
      notifications.assertError('already entitled/unentitled');
    });

    it('should invite users successfully from org which has autoentitlement flag disabled', function () {
      inviteEmail = users.inviteTestUser.usernameWithNoEntitlements;
      utils.click(users.clearButton);
      utils.sendKeys(users.addUsersField, inviteEmail);
      utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
    });

    it('clicking on cancel button should close the modal', function () {
      utils.click(users.closeAddUsers);
      utils.expectIsNotDisplayed(users.manageDialog);
    });
  });

  describe('Search for pending user', function () {
    it('should show invite pending status on new user', function () {
      utils.search(inviteEmail);
      utils.expectText(users.userListStatus.first(), 'Invite Pending');
    });

    it('should resend user invitation to pending user', function () {
      utils.click(users.userListAction);
      utils.click(users.resendInviteOption);
      notifications.assertSuccess('Successfully resent invitation');
    });

    it('should log out', function () {
      navigation.logout();
    });
  });
});
