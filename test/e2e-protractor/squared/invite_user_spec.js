'use strict';

/* globals LONG_TIMEOUT, manageUsersPage */

var featureToggle = require('../utils/featureToggle.utils');

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

  // TODO remove suite when atlasFTSWRemoveUsersSSO feature toggle is removed
  describe('Add users through first-time setup wizard', function () {

    var appWindow;

    it('should login as partner', function () {
      login.login('partner-admin', '#/partner/overview')
        .then(function (bearerToken) {
          token = bearerToken;
        });
    });

    // TODO remove spec when atlasFTSWRemoveUsersSSO feature toggle is removed
    it('should create a new trial', function () {
      if (featureToggle.features.atlasFTSWRemoveUsersSSO) {
        // Users can't be added from the FTSW
        return;
      }
      navigation.clickCustomers();
      utils.wait(partner.addButton, LONG_TIMEOUT);
      utils.click(partner.addButton);
      utils.expectIsDisplayed(partner.addTrialForm);

      utils.click(partner.messageTrialCheckbox);
      utils.click(partner.squaredUCTrialCheckbox);
      utils.click(partner.careTrialCheckbox);
      utils.click(partner.roomSystemsTrialCheckbox);
      utils.setCheckboxIfDisplayed(partner.sparkBoardTrialCheckbox, false, 100);
      utils.setCheckboxIfDisplayed(partner.webexTrialCheckbox, false, 100);
      utils.sendKeys(partner.customerNameInput, partner.newTrial.customerName);
      utils.sendKeys(partner.customerEmailInput, partner.newTrial.customerEmail);

      utils.click(partner.startTrialButton);
      notifications.assertSuccess(partner.newTrial.customerName, 'A trial was successfully started');

      appWindow = browser.getWindowHandle();
      utils.click(wizard.yesBtn);

      utils.switchToNewWindow().then(function () {
        // backend services are slow to check userauthinfo/accounts
        utils.wait(wizard.wizard, LONG_TIMEOUT);
        utils.expectIsDisplayed(wizard.leftNav);
        utils.expectIsDisplayed(wizard.mainView);
      });

    });

    // TODO remove spec when atlasFTSWRemoveUsersSSO feature toggle is removed
    it('should open First Time Setup wizard and navigate to Add Users', function () {
      if (featureToggle.features.atlasFTSWRemoveUsersSSO) {
        // Users can't be added from the FTSW
        return;
      }
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Plan Review');
      utils.click(wizard.beginBtn);
      utils.click(wizard.saveBtn);

      utils.expectTextToBeSet(wizard.mainviewTitle, 'Enterprise Settings');
      utils.click(wizard.nextBtn);
      utils.click(wizard.nextBtn);
    });

    // TODO remove spec when atlasFTSWRemoveUsersSSO feature toggle is removed
    it('should add users successfully', function () {
      if (featureToggle.features.atlasFTSWRemoveUsersSSO) {
        // Users can't be added from the FTSW
        return;
      }
      utils.expectTextToBeSet(wizard.mainviewTitle, 'Add Users');
      utils.click(inviteusers.manualUpload);
      utils.click(wizard.nextBtn);

      manuallyAddUsers();

      utils.expectIsDisplayed(users.saveButton);
      utils.click(users.saveButton);
    });

    // TODO remove spec when atlasFTSWRemoveUsersSSO feature toggle is removed
    it('should navigate to end of First Time Setup wizard', function () {
      if (featureToggle.features.atlasFTSWRemoveUsersSSO) {
        // Users can't be added from the FTSW
        return;
      }
      notifications.clearNotifications();

      utils.expectTextToBeSet(wizard.mainviewTitle, 'Get Started');
      utils.click(wizard.finishBtn);

      navigation.expectDriverCurrentUrl('overview');
      utils.expectIsDisplayed(navigation.tabs);
      utils.click(navigation.usersTab);
    });

    // TODO remove spec when atlasFTSWRemoveUsersSSO feature toggle is removed
    it('should show users pending', function () {
      if (featureToggle.features.atlasFTSWRemoveUsersSSO) {
        // Users can't be added from the FTSW
        return;
      }
      utils.search(inviteEmail);
      utils.expectText(users.userListStatus, 'Invite Pending');

      utils.search(inviteEmail2);
      utils.expectText(users.userListStatus, 'Invite Pending');
    });

    // TODO remove afterAll when atlasFTSWRemoveUsersSSO feature toggle is removed
    afterAll(function () {
      if (featureToggle.features.atlasFTSWRemoveUsersSSO) {
        // Users can't be added from the FTSW
        return navigation.logout();
      }
      browser.close();
      browser.switchTo().window(appWindow);

      // make sure we delete the partner org we created
      //utils.click(partner.trialFilter);
      utils.search(partner.newTrial.customerName, -1);
      utils.click(partner.newTrialRow);
      utils.expectIsDisplayed(partner.previewPanel);
      utils.scrollIntoView(partner.deleteCustomerButton);

      utils.click(partner.deleteCustomerButton);
      utils.waitForModal().then(function () {
        utils.click(partner.deleteCustomerOrgConfirm).then(function () {
          notifications.assertSuccess(partner.newTrial.customerName, 'successfully deleted');
        });
      });

      navigation.logout();

    });

  });

  ////////////////////////////

  describe('Add users through modal', function () {
    it('should login as pbr org admin and view users', function () {
      login.login('pbr-admin', '#/users')
        .then(function (bearerToken) {
          token = bearerToken;
        });
    });

    it('should open the Manage Users->Manually add users modal', function () {
      utils.click(navigation.usersTab);
      utils.click(manageUsersPage.buttons.manageUsers);
      utils.expectTextToBeSet(manageUsersPage.select.title, 'Add or Modify Users');
      utils.click(manageUsersPage.select.radio.orgManual);
      utils.click(manageUsersPage.buttons.next);
      utils.expectTextToBeSet(manageUsersPage.select.title, 'Manually Add or Modify Users');
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
