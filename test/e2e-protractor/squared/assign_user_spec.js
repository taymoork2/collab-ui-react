'use strict'

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('Squared Invite User and Assign Services User Flow', function () {

  var inviteEmail;

  it('should login as sqtest org admin and view users', function () {
    login.login('sqtest-admin', '#/users');
  });

  describe('Invite users through modal', function () {
    it('should click on invite users', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
      utils.expectIsDisplayed(users.nextButton);
      utils.expectIsNotDisplayed(users.onboardButton);
      utils.expectIsNotDisplayed(users.entitleButton);
      utils.expectIsNotDisplayed(users.addButton);
    });

    it('should invite a user', function () {
      inviteEmail = utils.randomTestGmail();

      utils.click(users.clearButton);

      utils.click(users.nameAndEmailRadio);
      utils.sendKeys(users.firstName, 'first');
      utils.sendKeys(users.lastName, 'last');
      utils.sendKeys(users.emailAddress, inviteEmail);
      utils.click(users.plusIcon);
      utils.click(users.nextButton);
    });

    it('should add licenses successfully', function () {
      //click on license checkbox
      utils.click(users.confCheckbox);

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);
    });

    it('should automatically close wizard', function () {
      utils.expectIsNotDisplayed(wizard.wizard);
    });

    it('should show invite pending status on new user', function () {
      utils.search(inviteEmail);
      utils.expectText(users.userListStatus.first(), 'Invite Pending');
    });

    it('should show conferencing license', function () {
      users.clickOnUser();
      utils.expectIsDisplayed(users.conferenceLicenses);
    });
  });
});
