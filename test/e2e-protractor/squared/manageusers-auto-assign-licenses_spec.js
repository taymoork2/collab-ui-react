'use strict';

var LoginPage = require('../pages/login.page');
var login = new LoginPage();
var featureToggle = require('../utils/featureToggle.utils');
var overview = require('../pages/overview.page');
const ManageUsersPage = require('../pages/manageUsers.page');
const manageUsers = new ManageUsersPage();
var utils = require('../utils/test.utils');

describe('Manage Users - Auto-Assign Licenses', function () {
  it('should login as a customer full admin', function () {
    login.login('account-admin', '#/overview');
  });

  it('should have an entry "Auto-Assign Licenses" for the "Licenses" card', function () {
    if (featureToggle.features.atlasF3745AutoAssignLicenses) {
      utils.expectIsDisplayed(overview.cards.licenses.headerText);
      utils.expectIsDisplayed(overview.cards.licenses.autoAssignLicensesText);
    }
  });

  it('should open modal to set up Auto-Assign Licenses', function () {
    if (featureToggle.features.atlasF3745AutoAssignLicenses) {
      utils.click(overview.cards.licenses.settingsIcon);
      utils.expectIsDisplayed(manageUsers.autoAssignLicenses.title);
    }
  });
});
