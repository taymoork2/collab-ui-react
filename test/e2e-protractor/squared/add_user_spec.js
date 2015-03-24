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

    it('should open add user modal in users page while clicking on the quick link', function () {
      utils.click(landing.addUserQuickLink);
      navigation.expectCurrentUrl('/users');
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

  describe('Delete user used for entitle test', function () {
    it('should delete added user', function () {
      deleteUtils.deleteUser(inputEmail);
    });
  });

  it('should log out', function () {
    navigation.logout();
  });

});
