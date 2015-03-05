'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
  searchStr: 'joshkuiros@gmail.com'
};

describe('Org Entitlement flow', function () {
  beforeEach(function() { browser.ignoreSynchronization = true; });
  afterEach(function() { browser.ignoreSynchronization = false; });

  it('should login as non-sso admin user', function () {
    login.login(testuser.username, testuser.password);
  });

  describe('without sync', function () {
    it('clicking on users tab should change the view', function () {
      navigation.clickUsers();
    });
  });

  it('should display conversations panel for test user', function () {
    utils.searchAndClick(testuser.searchStr);
  });

  it('should display subdetails panel', function () {
    utils.expectIsDisplayed(users.rolesChevron);
    utils.click(users.rolesChevron);
    utils.expectIsDisplayed(roles.rolesDetailsPanel);
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

    utils.click(roles.closeButton);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
