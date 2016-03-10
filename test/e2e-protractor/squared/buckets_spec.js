'use strict';

describe('Invite User and Check Buckets', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  var addEmail = utils.randomTestGmailwithSalt('buckets');

  //log in as admin with an account
  describe('Account Add User', function () {
    it('should login and view users', function () {
      login.login('account-admin', '#/users');
    });

    it('click on add button should pop up the adduser modal and display only invite button', function () {
      navigation.clickUsers();
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });

    describe('Add users', function () {
      it('should clear user input field and error message', function () {
        utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
        utils.click(users.clearButton);
        utils.expectTextToBeSet(users.addUsersField, '');
        utils.expectIsDisabled(users.nextButton);
      });

      it('click on enable services individually', function () {
        utils.sendKeys(users.addUsersField, addEmail);
        utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
        utils.click(users.nextButton);
        utils.expectIsDisplayed(users.messageLicenses);
        utils.expectIsDisplayed(users.conferenceLicenses);
        utils.expectIsDisplayed(users.communicationLicenses);
      });

      it('should add users successfully', function () {
        utils.click(users.onboardButton);
        notifications.assertSuccess(addEmail, 'onboarded successfully');
        utils.expectIsNotDisplayed(users.manageDialog);
      });
    });

    afterAll(function () {
      deleteUtils.deleteUser(addEmail);
    });
  });
});
