'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */

// commenting out until backend is fixed
xdescribe('Org Entitlement flow', function () {
  var newLastName = 'Doe';
  var newDisplayName = 'John Doe ' + utils.randomId();
  var searchStr = 'joshkuiros@gmail.com';

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as non-sso admin user and view users', function () {
    login.login('pbr-admin', '#/users');
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
    utils.expectIsDisplayed(roles.sipAddressesInput);
  });

  it('should display organization name', function () {
    utils.expectIsDisplayed(users.headerOrganizationName);
  });

  it('should edit last name and display name, roles & save', function () {
    roles.setLastName(newLastName);
    roles.setDisplayName(newDisplayName);
    utils.click(roles.fullAdmin);
    utils.click(roles.saveButton);

    notifications.assertSuccess('User successfully updated.');
  });

  it('should have full admin selected', function () {
    utils.expectRadioSelected(roles.fullAdminDiv);
  });

  it('should reverse role change', function () {
    utils.click(roles.noAdmin);
    utils.click(roles.saveButton);

    notifications.assertSuccess('User successfully updated.');
  });

  it('should verify user name change', function () {
    utils.expectRadioSelected(roles.noAdminDiv);

    roles.getDisplayName().then(function (userName) {
      utils.click(users.closeSidePanel);
      utils.searchAndClick(searchStr);
      utils.click(users.rolesChevron);
      utils.expectValueToBeSet(roles.displayNameInput, userName);
    });
  });
});
