// TODO: once 'atlas-f3745-auto-assign-licenses' is globally enabled:
// - delete test org:
//   - org name: Atlas_Test_atlas-web--ft--atlas-f3745-auto-assign-licenses
//   - org id: 8078642f-ab1a-4740-bd0a-61738ea76bf0
// - delete auth entry 'ft--atlas-f3745-auto-assign-licenses' in 'test_helper.js'
// - delete this file (obviated by 'manageusers-auto-assign-licenses_spec.js')

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

describe('Auto-Assign Licenses', function () {
  it('should login as a customer full admin', function () {
    login.login('ft--atlas-f3745-auto-assign-licenses', '#/overview');
  });

  describe('overview page:', function () {
    describe('overview card:', function () {
      it('should have a disabled entry "Auto-Assign Licenses" for the "Licenses" card', function () {
        utils.expectIsDisplayed(overview.cards.licenses.headerText);
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
    const testUserEmail = utils.randomTestGmail();

    it('should add a new user', function () {
      utils.click(navigation.usersTab);
      utils.click(manageUsers.buttons.manageUsers);
      utils.click(manageUsers.actionCards.manualAddUsers);
      utils.click(manageUsers.buttons.next);
      utils.click(users.addUsersField);
      utils.sendKeys(users.addUsersField, testUserEmail + protractor.Key.ENTER);
      utils.click(manageUsers.buttons.next);
      utils.click(manageUsers.buttons.save);
      utils.click(manageUsers.buttons.finish);
    });

    it('should validate that newly onboarded user has the message license', function () {
      utils.searchAndClick(testUserEmail);
      utils.expectIsDisplayed(users.messageService);
      utils.expectIsNotDisplayed(users.messageServiceFree);
      utils.click(users.closeSidePanel);
    });

    it('cleanup user', function () {
      utils.deleteIfUserExists(testUserEmail);
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
});
