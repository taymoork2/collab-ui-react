'use strict';

var featureToggle = require('../utils/featureToggle.utils');

/* globals manageUsersPage */

describe('Squared Add User Flow', function () {
  var token;
  var inviteEmail, inviteEmail2;

  function manuallyAddUsers() {
    utils.expectIsDisplayed(users.emailAddressRadio);
    utils.click(users.emailAddressRadio);

    inviteEmail = utils.randomTestGmail();
    inviteEmail2 = utils.randomTestGmail();

    utils.click(users.clearButton);
    utils.sendKeys(users.addUsersField, inviteEmail);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);

    utils.click(users.nameAndEmailRadio);
    utils.sendKeys(users.firstName, 'first');
    utils.sendKeys(users.lastName, 'last');
    utils.sendKeys(users.emailAddress, inviteEmail2);
    utils.click(users.plusIcon);

    utils.click(users.emailAddressRadio);

    utils.click(users.nextButton);
    utils.click(users.saveButton);
  }

  //////////////////////////

  describe('Add users through modal', function () {
    it('should login as pbr org admin and view users', function () {
      login.login('account-admin', '#/users')
        .then(function (bearerToken) {
          token = bearerToken;
        });
    });

    it('should open the Manage Users->Manually add users modal', function () {
      utils.click(navigation.usersTab);
      utils.click(manageUsersPage.buttons.manageUsers);
      if (featureToggle.features.atlasF3745AutoAssignLicenses) {
        utils.click(manageUsersPage.actionCards.manualAddOrModifyUsers);
      } else {
        utils.click(manageUsersPage.select.radio.orgManual);
        utils.click(manageUsersPage.buttons.next);
      }
      if (featureToggle.features.atlasEmailSuppress) {
        utils.wait(manageUsersPage.emailSuppress.emailSuppressIcon);
        utils.click(manageUsersPage.buttons.next);
      }
      utils.waitForText(manageUsersPage.select.title, 'Manually Add or Modify Users');
    });

    it('should add users successfully', function () {
      manuallyAddUsers();

      utils.expectIsDisplayed(users.finishButton);
      utils.click(users.finishButton);
      utils.expectIsNotDisplayed(users.manageDialog);
    });

    it('should show add pending status on new user 1', function () {
      utils.search(inviteEmail);
      utils.expectText(users.userListStatus, 'Invite Pending');
    });

    it('should resend user invitation to pending user', function () {
      utils.click(users.userListAction);
      utils.click(users.resendInviteOption);
      notifications.assertSuccess('Email sent successfully');
    });

    it('should show invite pending status on new user 2', function () {
      utils.search(inviteEmail2);
      utils.expectText(users.userListStatus, 'Invite Pending');
    });

    afterAll(function () {
      deleteUtils.deleteUser(inviteEmail, token);
      deleteUtils.deleteUser(inviteEmail2, token);
    });
  });
});
