'use strict';

const LoginPage = require('../pages/login.page');
const login = new LoginPage();
const overview = require('../pages/overview.page');
const ManageUsersPage = require('../pages/manageUsers.page');
const manageUsers = new ManageUsersPage();
const NavigationPage = require('../pages/navigation.page');
const navigation = new NavigationPage();
const NotificationsPage = require('../pages/notifications.page');
const notifications = new NotificationsPage();
const UsersPage = require('../pages/users.page');
const users = new UsersPage();

const utils = require('../utils/test.utils');
const deleteUtils = require('../utils/delete.utils');
const helper = require('../../api_sanity/test_helper.js');

let bearerToken;
const testUserEmail1 = utils.randomTestGmail();
const testUserEmail2 = utils.randomTestGmail();
const testAccountKey = 'ft--atlas-f3745-auto-assign-licenses';

describe('Auto-Assign Licenses', function () {
  it('should login as a customer full admin', function () {
    login.login(testAccountKey, '#/overview')
      .then(function (_bearerToken) {
        bearerToken = _bearerToken;
      });
  });

  describe('overview page:', function () {
    describe('overview card:', function () {
      it('should have a disabled entry "Auto-Assign Licenses" for the "Licenses" card', function () {
        utils.expectIsDisplayed(overview.cards.licenses.headerIcon);
        utils.expectIsDisplayed(overview.cards.licenses.autoAssignLicensesStatusIndicator);
        utils.expectIsDisplayed(overview.cards.licenses.autoAssignLicensesText);
      });

      it('should open modal to set up Auto-Assign Licenses when clicking settings icon', function () {
        utils.click(overview.cards.licenses.settingsIcon);
        utils.expectIsDisplayed(manageUsers.autoAssignTemplate.createTemplate.title);
        utils.expectIsDisplayed(manageUsers.autoAssignTemplate.createTemplate.subtitle);
        utils.clickEscape();
        utils.click(navigation.homeTab);
      });
    });

    describe('notification column:', function () {
      it('should have an item in the notifications column highlighting Auto-Assign Licenses', function () {
        utils.expectIsDisplayed(overview.notificationItems.autoAssign.bodyText);
        utils.click(overview.notificationItems.autoAssign.link);
        utils.expectIsDisplayed(manageUsers.autoAssignTemplate.createTemplate.subtitle);
        utils.clickEscape();
        utils.click(navigation.homeTab);
      });
    });
  });

  describe('create template:', function () {
    it('should start the wizard for a new auto-assign template from the users tab', function () {
      utils.click(navigation.usersTab);
      utils.click(manageUsers.buttons.manageUsers);
      utils.click(manageUsers.links.setupAutoAssignTemplate);
      utils.expectIsDisplayed(manageUsers.autoAssignTemplate.createTemplate.subtitle);
    });

    it('should verify default button behavior', function () {
      utils.expectIsEnabled(manageUsers.buttons.back);
      utils.expectIsDisabled(manageUsers.buttons.next);
    });

    it('should have at least one subscription with one messaging license', function () {
      utils.expectIsDisplayed(manageUsers.autoAssignTemplate.assignableServices.licenses.messaging.firstLicense);
    });

    it('should proceed once a license (any license) is selected', function () {
      utils.click(manageUsers.autoAssignTemplate.assignableServices.licenses.messaging.firstLicense);
      utils.expectIsEnabled(manageUsers.buttons.next);
      utils.click(manageUsers.buttons.next);
    });

    it('should display auto-assign template summary', function () {
      utils.expectIsDisplayed(manageUsers.autoAssignTemplate.templateSummary.summary);
      utils.expectIsDisplayed(manageUsers.autoAssignTemplate.templateSummary.messagingItem);
    });

    it('should save the auto-assign template', function () {
      utils.expectIsEnabled(manageUsers.buttons.save);
      utils.click(manageUsers.buttons.save);
      notifications.assertSuccess('Your license template has been set up successfully');
    });
  });

  describe('manual onboard a user using auto-assign template:', function () {
    it('should add a new user', function () {
      users.createUserWithAutoAssignTemplate(testUserEmail1);
    });

    it('should validate that newly onboarded user has the message license', function () {
      utils.searchAndClick(testUserEmail1);
      utils.expectIsDisplayed(users.messageService);
      utils.expectIsNotDisplayed(users.messageServiceFree);
      utils.click(users.closeSidePanel);
    });

    it('should NOT allow manual onboarding of existing user (because auto-assign template is active)', function () {
      utils.click(navigation.usersTab);
      utils.click(manageUsers.buttons.manageUsers);
      utils.click(manageUsers.actionCards.manualAddUsers);
      utils.click(manageUsers.buttons.next);
      utils.click(users.addUsersField);
      utils.sendKeys(users.addUsersField, testUserEmail1 + protractor.Key.ENTER);
      utils.expectIsDisplayed(manageUsers.manual.errors.autoAssignTemplateEnabledCannotOnboardExistingUser);
      utils.expectIsDisabled(manageUsers.buttons.next);
      utils.click(manageUsers.buttons.modalCloseButton);
    });
  });

  describe('modify template:', function () {
    it('should enter the wizard to modify the default auto-assign template from the users tab', function () {
      utils.click(navigation.usersTab);
      utils.click(manageUsers.buttons.manageUsers);
      utils.click(manageUsers.autoAssignTemplate.optionsMenu.toggleButton);
      utils.click(manageUsers.autoAssignTemplate.optionsMenu.modify);
      utils.expectIsDisplayed(manageUsers.autoAssignTemplate.createTemplate.subtitle);
    });

    it('should have the first messaging license checkbox already selected', function () {
      utils.expectCheckboxIsChecked(manageUsers.autoAssignTemplate.assignableServices.licenses.messaging.firstLicenseCheckbox, true);
    });

    it('should show an error message if no licenses are selected', function () {
      utils.click(manageUsers.autoAssignTemplate.assignableServices.licenses.messaging.firstLicense);
      utils.expectIsDisplayed(element(by.cssContainingText('.modal-footer__warning h6', 'At least one service needs to be selected to continue')));
      utils.click(manageUsers.autoAssignTemplate.assignableServices.licenses.messaging.firstLicense);
    });

    it('should proceed once template has been modified (ie. any other previously-unselected license is selected)', function () {
      utils.click(manageUsers.autoAssignTemplate.assignableServices.licenses.meeting.firstLicense);
      utils.expectIsEnabled(manageUsers.buttons.next);
      utils.click(manageUsers.buttons.next);
    });

    it('should display auto-assign template summary', function () {
      utils.expectIsDisplayed(manageUsers.autoAssignTemplate.templateSummary.summary);
      utils.expectIsDisplayed(manageUsers.autoAssignTemplate.templateSummary.messagingItem);
      utils.expectIsDisplayed(manageUsers.autoAssignTemplate.templateSummary.meetingItem);
    });

    it('should save the auto-assign template', function () {
      utils.expectIsEnabled(manageUsers.buttons.save);
      utils.click(manageUsers.buttons.save);
      notifications.assertSuccess('Your license template has been modified successfully');
    });
  });

  describe('manual onboard a second user after modifying the auto-assign template:', function () {
    it('should add a second new user', function () {
      users.createUserWithAutoAssignTemplate(testUserEmail2);
    });

    it('should validate that newly onboarded user has both paid message and meeting licenses', function () {
      utils.searchAndClick(testUserEmail2);
      utils.expectIsDisplayed(users.messageService);
      utils.expectIsNotDisplayed(users.messageServiceFree);
      utils.expectIsDisplayed(users.meetingService);
      utils.expectIsNotDisplayed(users.meetingServiceFree);
      utils.click(users.closeSidePanel);
    });
  });

  describe('delete template:', function () {
    it('should delete the default auto-assign template', function () {
      utils.click(navigation.usersTab);
      utils.click(manageUsers.buttons.manageUsers);
      utils.click(manageUsers.autoAssignTemplate.optionsMenu.toggleButton);
      utils.click(manageUsers.autoAssignTemplate.optionsMenu.delete);
      utils.click(manageUsers.autoAssignTemplate.optionsMenu.deleteConfirm);
      notifications.assertSuccess('Template was deleted successfully');
      utils.click(manageUsers.buttons.modalCloseButton);
      utils.click(manageUsers.buttons.manageUsers);
      utils.expectIsDisplayed(manageUsers.links.setupAutoAssignTemplate);
    });
  });

  afterAll(function () {
    // delete all test users and auto-assign templates (as of 2018-03-23, there will only be one)
    deleteUtils.deleteUser(testUserEmail1, bearerToken);
    deleteUtils.deleteUser(testUserEmail2, bearerToken);

    const testOrgId = helper.auth[testAccountKey].org;
    deleteUtils.deleteAllAutoAssignTemplates(testOrgId, bearerToken);
  });
});
