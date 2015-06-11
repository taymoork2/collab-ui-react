'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */

describe('Org Entitlement flow', function () {
  var newLastName = 'Doe';
  var newDisplayName = 'John Doe ' + utils.randomId();
  var searchStr = 'joshkuiros@gmail.com';

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors();
  });

  it('should login as non-sso admin user', function () {
    login.login('pbr-admin');
  });

  describe('without sync', function () {
    it('clicking on users tab should change the view', function () {
      navigation.clickUsers();
    });
  });

  it('should display conversations panel for test user', function () {
    utils.searchAndClick(searchStr);
  });

  it('should display subdetails panel', function () {
    utils.expectIsDisplayed(users.rolesChevron);
    utils.click(users.rolesChevron);
    utils.expectIsDisplayed(roles.rolesDetailsPanel);
    utils.expectIsDisplayed(roles.emailInput);
    utils.expectIsDisplayed(roles.displayNameInput);
    utils.expectIsDisabled(roles.emailInput);
  });

  it('should edit last name and display name, roles & save', function () {
    roles.setLastName(newLastName);
    roles.setDisplayName(newDisplayName);
    utils.click(roles.fullAdmin);
    utils.click(roles.saveButton);

    notifications.assertSuccess('User successfully updated.');
    notifications.clearNotifications();
  });

  it('should reverse role change', function () {
    utils.click(roles.noAdmin);
    utils.click(roles.saveButton);

    notifications.assertSuccess('User successfully updated.');
    notifications.clearNotifications();
  });

  it('should verify user name change', function () {
    roles.getDisplayName().then(function (userName) {
      utils.click(users.closeSidePanel);
      utils.search(searchStr);
      utils.expectText(users.userListDisplayName, userName);
    });
  });

  it('should log out', function () {
    navigation.logout();
  });
});
