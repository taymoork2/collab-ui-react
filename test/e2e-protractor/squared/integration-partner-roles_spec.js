'use strict';

/* global LONG_TIMEOUT */

describe('Org Entitlement flow', function () {
  var token;
  var testUser = utils.randomTestGmailWithSalt('roles');
  var newLastName = 'Doe';
  var newDisplayName = 'John Doe ' + utils.randomId();

  it('should login as non-sso admin user', function () {
    login.login('partner-admin')
      .then(function (bearerToken) {
        token = bearerToken;
      });
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
    users.createUser(testUser);
    utils.click(users.saveButton);
    utils.click(users.finishButton);
    utils.expectIsNotDisplayed(users.manageDialog);
    utils.searchAndClick(testUser);
  });

  it('should display subdetails panel', function () {
    utils.expectIsDisplayed(users.userEditIcon);
    utils.click(users.userEditIcon);
    utils.expectIsDisplayed(roles.rolesDetailsPanel);
    utils.expectIsDisplayed(roles.emailInput);
    utils.expectIsDisplayed(roles.displayNameInput);
    utils.expectIsDisabled(roles.emailInput);
  });

  it('should edit last name and display name and save', function () {
    roles.setLastName(newLastName);
    roles.setDisplayName(newDisplayName);
    utils.click(roles.saveButton);
    notifications.assertSuccess('User successfully updated.');
  });

  it('should edit roles and save', function () {
    utils.click(users.closeSidePanel);
    utils.clickUser(testUser);
    utils.click(users.rolesAndSecurityMenuOption);
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
    utils.click(users.closeSidePanel);
    utils.searchAndClick(testUser);
    utils.click(users.userEditIcon);
    utils.expectValueToBeSet(roles.displayNameInput, newDisplayName);
  });

  afterAll(function () {
    deleteUtils.deleteUser(testUser, token);
  });
});
