'use strict';

var featureToggle = require('../utils/featureToggle.utils');

describe('Manage Users - Auto-Assign Licenses', function () {
  it('should login as a customer full admin', function () {
    login.login('account-admin', '#/overview');
  });

  it('should have an entry "Auto-Assign Licenses" for the "Licenses" card', function () {
    if (featureToggle.features.atlasF3745AutoAssignLicenses) {
      utils.expectIsDisplayed(overviewPage.cards.licenses.headerText);
      utils.expectIsDisplayed(overviewPage.cards.licenses.autoAssignLicensesText);
    }
  });
});
