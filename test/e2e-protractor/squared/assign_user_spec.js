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

    it('should show invite pending status on new user', function () {
      utils.search(inviteEmail);
      utils.expectTextToBeSet(users.userListStatus, 'Invite Pending');
    });

    it('should add licenses successfully', function () {
      utils.clickUser(inviteEmail);
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
      utils.waitForModal().then(function () {
        //click on license checkbox
        utils.click(users.paidMsgCheckbox);
        utils.click(users.paidMtgCheckbox);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
        utils.expectIsDisplayed(users.servicesPanel);
        utils.expectIsDisplayed(users.messageService);
      });
    });

    it('should check if licenses saved successfully', function () {
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
      utils.waitForModal().then(function () {
        utils.expectCheckbox(users.paidMsgCheckbox, true);
        utils.expectCheckbox(users.paidMtgCheckbox, true);
      });
    });

    it('should uncheck licenses successfully', function () {
      utils.waitForModal().then(function () {
        utils.click(users.paidMsgCheckbox);
        utils.click(users.paidMtgCheckbox);
        utils.click(users.saveButton);
        utils.expectIsDisplayed(users.servicesPanel);
      });
    });

    it('should check if licenses were saved successfully after being unchecked', function () {
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);

      utils.waitForModal().then(function () {
        utils.expectCheckbox(users.paidMsgCheckbox, false);
        utils.expectCheckbox(users.paidMtgCheckbox, false);
        utils.click(users.saveButton);
      });
    });

    afterAll(function () {
      deleteUtils.deleteUser(inviteEmail);
    });
  });
});
