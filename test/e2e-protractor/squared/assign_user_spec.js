'use strict';

describe('Squared Invite User and Assign Services User Flow', function () {

  var inviteEmail;

  it('should login as sqtest org admin and view users', function () {
    login.login('account-admin', '#/users');
  });

  it('should click on invite users', function () {
    utils.click(users.addUsers);
    utils.expectIsDisplayed(users.manageDialog);
    utils.expectIsDisplayed(users.nextButton);
    utils.expectIsNotDisplayed(users.onboardButton);
    utils.expectIsNotDisplayed(users.entitleButton);
    utils.expectIsNotDisplayed(users.addButton);
  });

  describe('Invite users through modal', function () {
    it('should invite a user', function () {
      inviteEmail = utils.randomTestGmail();

      utils.click(users.clearButton);

      utils.click(users.nameAndEmailRadio);
      utils.sendKeys(users.firstName, 'first');
      utils.sendKeys(users.lastName, 'last');
      utils.sendKeys(users.emailAddress, inviteEmail);
      utils.click(users.plusIcon);
      utils.click(users.nextButton);

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);
    });

    it('should automatically close wizard', function () {
      utils.expectIsNotDisplayed(wizard.wizard);
    });

    xit('should show invite pending status on new user', function () {
      utils.searchAndClick(inviteEmail);
      utils.expectTextToBeSet(users.userListSelStatus, 'Invite Pending');
    });

    it('expect edit services is showing', function () {
      utils.clickUser(inviteEmail);
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
    });

    it('should add licenses successfully', function () {
      //click on license checkbox
      utils.click(users.paidMsg);
      utils.click(users.saveButton);
      notifications.assertSuccess('entitled successfully');
      utils.expectIsDisplayed(users.servicesPanel);
      utils.expectIsDisplayed(users.messageService);
    });

    afterAll(function () {
      deleteUtils.deleteUser(inviteEmail);
    });
  });
});
