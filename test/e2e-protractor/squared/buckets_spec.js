'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('Invite User and Check Buckets', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });
  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors(this.getFullName());
  });

  //log in as admin with an account
  xdescribe('Account Add User', function () {
    var addEmail = utils.randomTestGmail();

    it('should login', function () {
      login.login('account-admin');
    });

    it('clicking on users tab should change the view', function () {
      navigation.clickUsers();
    });

    it('click on add button should pop up the adduser modal and display only invite button', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });

    describe('check account buckets', function () {
      it('should clear user input field and error message', function () {
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.clearButton);
        utils.expectText(users.addUsersField, '');
      });

      it('click on enable services individually', function () {
        utils.click(users.collabRadio1);
        utils.expectIsDisplayed(users.messageLicenses);
        utils.expectIsDisplayed(users.conferenceLicenses);
        utils.expectIsDisplayed(users.communicationLicenses);
      });
    });

    describe('Add users', function () {
      it('should add users successfully', function () {
        utils.click(users.clearButton);
        users.addUsersField.sendKeys(addEmail);
        users.addUsersField.sendKeys(protractor.Key.ENTER);
        utils.click(users.collabRadio1);
        utils.click(users.onboardButton);
        notifications.assertSuccess(addEmail, 'sent successfully');
        notifications.clearNotifications();
      });
      it('clicking on cancel button should close the modal', function () {
        utils.click(users.closeAddUsers);
        utils.expectIsNotDisplayed(users.manageDialog);
      });
    });

    describe('Delete user used for entitle test', function () {
      it('should delete added user', function () {
        deleteUtils.deleteUser(addEmail);
      });
    });

    it('should log out', function () {
      navigation.logout();
    });
  });
});
