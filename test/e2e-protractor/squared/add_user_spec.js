'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('Squared Add & Entitle User Flows', function () {

  var inputEmail = utils.randomTestGmail();

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors();
  });

  describe('Login as users.testUser admin and launch add users modal', function () {
    it('should login as users.testUser admin', function () {
      login.login('test-user');
    });

    it('clicking on users tab should change the view', function () {
      navigation.clickUsers();
    });

    it('click on add button should pop up the adduser modal and display only invite button', function () {
      utils.click(users.addUsers);
      utils.expectIsDisplayed(users.manageDialog);
    });

  });

  describe('Add an existing user', function () {
    it('should display input user email in results with already exists message', function () {
      utils.click(users.clearButton);
      utils.sendKeys(users.addUsersField, users.testUser.username);
      utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
      utils.click(users.collabRadio1);
      utils.click(users.onboardButton);
      notifications.assertError('already entitled/unentitled');
      notifications.clearNotifications();
    });
  });

  describe('Add a new user', function () {
    it('should display input user email in results with success message', function () {
      utils.click(users.clearButton);
      utils.sendKeys(users.addUsersField, inputEmail);
      utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
      utils.click(users.collabRadio1);
      utils.click(users.onboardButton);
      notifications.assertSuccess(inputEmail, 'onboarded successfully');
      notifications.clearNotifications();
    });
  });

  describe('Delete user and log out', function () {
    it('clicking on cancel button should close the modal', function () {
      utils.click(users.closeAddUsers);
      utils.expectIsNotDisplayed(users.manageDialog);
    });
  });

  describe('Soft Delete user used for entitle test', function () {
    it('should soft delete added user and the user should not show up in search results', function () {
      utils.search(inputEmail);
      utils.click(users.userListAction);
      utils.click(users.deleteUserOption);
      utils.expectIsDisplayed(users.deleteUserModal);
      utils.click(users.deleteUserButton);
      notifications.assertSuccess(inputEmail, 'deleted successfully');
      utils.expectIsNotDisplayed(users.deleteUserModal);
      notifications.clearNotifications();
      users.assertResultsLength(0);
    });
  });

  describe('Delete user used for entitle test', function () {
    it('should delete added user', function () {
      deleteUtils.deleteUser(inputEmail);
    });
  });

  it('should log out', function () {
    navigation.logout();
  });

});
