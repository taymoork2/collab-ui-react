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
const utils = require('../utils/test.utils');

describe('Manage Users - Auto-Assign Licenses', function () {
  it('should login as a customer full admin', function () {
    login.login('ft--atlas-f3745-auto-assign-licenses', '#/overview');
  });

  it('should have an entry "Auto-Assign Licenses" for the "Licenses" card', function () {
    utils.expectIsDisplayed(overview.cards.licenses.headerText);
    utils.expectIsDisplayed(overview.cards.licenses.autoAssignLicensesText);
  });

  it('should open modal to set up Auto-Assign Licenses', function () {
    utils.click(overview.cards.licenses.settingsIcon);
    utils.expectIsDisplayed(manageUsers.autoAssignLicenses.title);
  });
});
