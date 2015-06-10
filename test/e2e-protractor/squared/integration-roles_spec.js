'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */

describe('Org Entitlement flow', function () {
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
    utils.expectIsDisabled(roles.emailInput);
    utils.expectIsDisplayed(roles.displayNameInput);
    utils.expectIsDisplayed(roles.sipAddressesInput);
  });

  it('should display organization name', function () {
    utils.expectIsDisplayed(users.headerOrganizationName);
  });

  it('should edit last name and display name, roles & save', function () {
    roles.editLastName();
    roles.editDisplayName();
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

    utils.click(users.closeSidePanel);
  });

  it('should verify user name change', function () {
    var user = roles.getCreatedUser();
    utils.search(user);
    utils.expectText(users.userListDisplayName, user);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
