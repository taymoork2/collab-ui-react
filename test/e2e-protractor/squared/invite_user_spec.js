'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('Squared Invite User Flow', function () {

  var inviteEmail, inviteEmail2;

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as pbr org admin and view users', function () {
    login.login('pbr-admin', '#/users');
  });

  describe('Invite users through modal', function () {

    it('click on add button should pop up the adduser modal', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
      utils.expectIsDisplayed(users.nextButton);
      utils.expectIsNotDisplayed(users.onboardButton);
      utils.expectIsNotDisplayed(users.entitleButton);
      utils.expectIsNotDisplayed(users.addButton);
    });

    it('should invite users successfully', function () {
      inviteEmail = utils.randomTestGmail();
      inviteEmail2 = utils.randomTestGmail();

      utils.click(users.clearButton);
      utils.sendKeys(users.addUsersField, inviteEmail);
      utils.sendKeys(users.addUsersField, protractor.Key.ENTER);

      utils.click(users.nameAndEmailRadio);
      utils.sendKeys(users.firstName, 'first');
      utils.sendKeys(users.lastName, 'last');
      utils.sendKeys(users.emailAddress, inviteEmail2);
      utils.click(users.plusIcon);

      utils.click(users.emailAddressRadio);

      utils.click(users.nextButton);
      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);
    });

    it('should show invite pending status on new user 1', function () {
      utils.search(inviteEmail);
      utils.expectText(users.userListStatus.first(), 'Invite Pending');
    });

    it('should resend user invitation to pending user', function () {
      utils.click(users.userListAction);
      utils.click(users.resendInviteOption);
      notifications.assertSuccess('Email sent successfully');
    });

    it('should show invite pending status on new user 2', function () {
      utils.search(inviteEmail2);
      utils.expectText(users.userListStatus.first(), 'Invite Pending');
    });

    afterAll(function () {
      deleteUtils.deleteUser(inviteEmail);
      deleteUtils.deleteUser(inviteEmail2);
    });

  });

  describe('Invite users through wizard', function () {

    it('should open the Add Users wizard', function () {
      navigation.clickAddUsers();
      utils.expectIsDisplayed(wizard.manualSubtitle);
      utils.click(wizard.nextBtn);
    });

    it('should invite users successfully', function () {
      inviteEmail = utils.randomTestGmail();
      inviteEmail2 = utils.randomTestGmail();

      utils.sendKeys(users.addUsersField, inviteEmail);
      utils.sendKeys(users.addUsersField, protractor.Key.ENTER);

      utils.click(users.nameAndEmailRadio);
      utils.sendKeys(users.firstName, 'first');
      utils.sendKeys(users.lastName, 'last');
      utils.sendKeys(users.emailAddress, inviteEmail2);
      utils.click(users.plusIcon);

      utils.click(users.emailAddressRadio);

      utils.click(wizard.nextBtn);
      utils.click(wizard.finishBtn);
      notifications.assertSuccess('onboarded successfully');
    });

    it('should automatically close wizard', function () {
      utils.expectIsNotDisplayed(wizard.wizard);
    });

    it('should show invite pending status on new user 1', function () {
      utils.search(inviteEmail);
      utils.expectText(users.userListStatus.first(), 'Invite Pending');
    });

    it('should resend user invitation to pending user', function () {
      utils.click(users.userListAction);
      utils.click(users.resendInviteOption);
      notifications.assertSuccess('Email sent successfully');
    });

    it('should show invite pending status on new user 2', function () {
      utils.search(inviteEmail2);
      utils.expectText(users.userListStatus.first(), 'Invite Pending');
    });

    afterAll(function () {
      deleteUtils.deleteUser(inviteEmail);
      deleteUtils.deleteUser(inviteEmail2);
    });

  });
});
