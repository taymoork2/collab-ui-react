'use strict';

/* global LONG_TIMEOUT */

describe('Org Entitlement flow', function () {
  var newLastName = 'Doe';
  var newDisplayName = 'John Doe ' + utils.randomId();
  var searchStr = 'sq-testpaiduser@atlas.test.com';

  it('should login as non-sso admin user', function () {
    login.login('partner-admin');
  });

  it('should launch partner organization portal', function () {
    navigation.clickCustomers();
    utils.click(partner.myOrganization);
    utils.click(partner.launchButton);
    utils.switchToNewWindow().then(function () {
      // backend services are slow to check userauthinfo/accounts
      utils.wait(navigation.tabs, LONG_TIMEOUT);
      navigation.clickUsers();
    });
  }, LONG_TIMEOUT);

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

  it('should edit last name and display name, roles & save', function () {
    roles.setLastName(newLastName);
    roles.setDisplayName(newDisplayName);
    utils.click(roles.salesAdmin);
    utils.click(roles.saveButton);

    notifications.assertSuccess('User successfully updated.');
  });

  it('should reverse role change', function () {
    utils.click(roles.fullAdmin);
    utils.click(roles.noAdmin);
    utils.click(roles.saveButton);

    notifications.assertSuccess('User successfully updated.');
  });

  it('should verify user name change', function () {
    roles.getDisplayName().then(function (userName) {
      utils.click(users.closeSidePanel);
      utils.searchAndClick(searchStr);
      utils.click(users.rolesChevron);
      utils.expectValueToBeSet(roles.displayNameInput, userName);
    });
  });
});
