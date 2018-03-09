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
        utils.expectIsDisplayed(manageUsers.autoAssignTemplate.createTemplate.title);
        utils.expectIsDisplayed(manageUsers.autoAssignTemplate.createTemplate.subtitle);
        utils.clickEscape();
        utils.click(navigation.homeTab);
      });
    });
  });
});
