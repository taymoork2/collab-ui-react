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
  });

  it('should edit last name, roles & save', function () {
    roles.editLastName();
    utils.click(roles.fullAdmin);
    utils.click(roles.saveButton);

    notifications.assertSuccess('User successfully updated.');
  });

  it('should reverse role change', function () {
    utils.click(roles.noAdmin);
    utils.click(roles.saveButton);

    notifications.assertSuccess('User successfully updated.');

    utils.click(users.closeSidePanel);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
