'use strict';

/* global manageUsersPage xafterAll */
/* global LONG_TIMEOUT */

// NOTE: Be sure to re-enable the afterAll at line 144 when re-enabling this test!
xdescribe('Manage Users - Manual -', function () {
  var token;

  var usersEmailOnly = _.times(2, function () {
    return {
      email: utils.randomTestGmailwithSalt('manual'),
      first: 'EmailOnly',
      last: 'McTestuser-' + utils.randomDid()
    };
  });

  var usersNamesAndEmail = _.times(2, function () {
    return {
      email: utils.randomTestGmailwithSalt('manual'),
      first: 'NamesAndEmail',
      last: 'McTestuser-' + utils.randomDid()
    };
  });

  var allUsers = usersEmailOnly.concat(usersNamesAndEmail);

  ///////////////

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users')
      .then(function (_token) {
        token = _token;
      });
  });

  describe('Standard Org', function () {

    it('should select manually add/modify users', function () {
      utils.click(navigation.usersTab);
      utils.click(manageUsersPage.buttons.manageUsers);
      utils.expectTextToBeSet(manageUsersPage.select.title, 'Add or Modify Users');
      utils.click(manageUsersPage.select.radio.orgManual);
      utils.click(manageUsersPage.buttons.next);
      utils.expectTextToBeSet(manageUsersPage.select.title, 'Manually Add or Modify Users');
    });

    it('should clear all users when Clear button pressed', function () {

      utils.click(manageUsersPage.manual.radio.emailAddress);

      utils.expectIsNotDisplayed(manageUsersPage.manual.emailAddress.tokens);

      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, usersEmailOnly[0].email + ', ');
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, usersEmailOnly[0].email + ', ');
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, usersEmailOnly[0].email);
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, protractor.Key.ENTER);

      // duplicate emails are errors.
      utils.expectCount(manageUsersPage.manual.emailAddress.tokens, 3);
      utils.expectCount(manageUsersPage.manual.emailAddress.invalidTokens, 2);

      utils.click(manageUsersPage.manual.clearButton);

      utils.expectIsNotDisplayed(manageUsersPage.manual.emailAddress.tokens);

    });

    it('should display an error if more then 25 users are being added', function () {

      utils.click(manageUsersPage.manual.radio.emailAddress);
      utils.expectIsNotDisplayed(manageUsersPage.manual.errorOverMaxUsers);

      for (var ii = 0; ii < 25; ii++) {
        utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, usersEmailOnly[0].email + ', ');
      }
      utils.expectIsNotDisplayed(manageUsersPage.manual.errorOverMaxUsers);

      // add one more to put us over the top
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, usersEmailOnly[0].email + ', ');

      utils.expectIsDisplayed(manageUsersPage.manual.errorOverMaxUsers);

      utils.click(manageUsersPage.manual.clearButton);
    });

    it('should add users by email address', function () {

      // Enter test email into edit box
      utils.click(manageUsersPage.manual.radio.emailAddress);
      _.forEach(usersEmailOnly, function (user) {
        utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, user.email + ', ');
      });
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, protractor.Key.ENTER);

    });

    it('should Manually Invite multiple users by name and email address', function () {

      // Enter test email into edit box
      utils.click(manageUsersPage.manual.radio.nameAndEmail);
      _.forEach(usersNamesAndEmail, function (user) {
        utils.sendKeys(manageUsersPage.manual.namesAndEmail.firstName, user.first);
        utils.sendKeys(manageUsersPage.manual.namesAndEmail.lastName, user.last);
        utils.sendKeys(manageUsersPage.manual.namesAndEmail.emailAddress, user.email);
        utils.click(manageUsersPage.manual.namesAndEmail.plusIcon);
      });

      utils.click(manageUsersPage.buttons.next);
    });

    it('should setup services for users (Message On)', function () {

      utils.expectTextToBeSet(manageUsersPage.select.title, 'Add Services for Users');

      // Need a license for valid HS services
      utils.click(manageUsersPage.manual.paidMsgCheckbox);
      utils.expectIsDisplayed(manageUsersPage.buttons.save);
      utils.click(manageUsersPage.buttons.save);

      _.each(allUsers, function (user) {
        activate.setup(null, user.email);
      });

      utils.expectTextToBeSet(manageUsersPage.importStatus.newUsers, '' + allUsers.length);
      utils.expectTextToBeSet(manageUsersPage.importStatus.updatedUsers, '0');
      utils.expectTextToBeSet(manageUsersPage.importStatus.errorUsers, '0');

      utils.click(manageUsersPage.buttons.finish);
    });

    it('should confirm invited users exist and have licenses/entitlements set', function () {
      _.each(allUsers, function (user) {
        utils.searchAndClick(user.email);
        utils.expectIsDisplayed(users.servicesPanel);

        utils.expectIsDisplayed(users.messageService);
        utils.expectIsNotDisplayed(users.meetingService);
        utils.click(users.closeSidePanel);
      });
    });

    // delete all the users we created
    xafterAll(function () {
      _.each(allUsers, function (user) {
        deleteUtils.deleteUser(user.email, token);
      });
    });

  });
});
