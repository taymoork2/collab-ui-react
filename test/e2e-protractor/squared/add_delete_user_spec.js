'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('Squared Add & Entitle User Flows', function () {
  var inputEmail = utils.randomTestGmail();
  var adminEmail = 'atlasmapservice+ll1@gmail.com';

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  describe('Login as users.testUser admin and launch add users modal', function () {
    it('should login as users.testUser admin', function () {
      login.login('test-user', '#/users');
    });

    it('click on add button should pop up the adduser modal and display only invite button', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });
  });

  describe('Add a new user', function () {
    it('should display input user email in results with success message', function () {
      utils.click(users.clearButton);
      utils.sendKeys(users.addUsersField, inputEmail);
      utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
      utils.click(users.nextButton);
      utils.click(users.onboardButton);
      notifications.assertSuccess(inputEmail, 'onboarded successfully');
      notifications.clearNotifications();
      utils.expectIsNotDisplayed(users.manageDialog);
    });
  });

  describe('Delete user and log out', function () {
    it('should soft delete added user used for entitle test and the user should not show up in search results', function () {
      utils.search(inputEmail);
      utils.click(users.userListAction);
      utils.click(users.deleteUserOption);
      utils.expectIsDisplayed(users.deleteUserModal);
      utils.click(users.deleteUserButton);
      notifications.assertSuccess(inputEmail, 'deleted successfully');
      utils.expectIsNotDisplayed(users.deleteUserModal);
      notifications.clearNotifications();
      utils.expectRowIsNotDisplayed(inputEmail);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('Login as users.testUser admin and launch add users modal', function () {
    it('should login as users.testUser admin', function () {
      login.login('test-user', '#/users');
    });

    it('admin should type Yes to delete themselves', function () {
      // Need to search for a single search result first, otherwise
      // Stale element when trying to click a user already visible
      utils.searchForSingleResult(adminEmail);
      utils.click(users.userListAction);
      utils.click(users.deleteUserOption);
      utils.waitForModal().then(function () {
        utils.waitUntilDisabled(users.deleteUserButton);
        utils.sendKeys(users.inputYes, 'yes');
        utils.waitUntilEnabled(users.deleteUserButton);
      });
    });
  });

});
