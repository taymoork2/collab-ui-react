'use strict';

var OverviewPage = {
  cards: {
    licenses: {
      headerText: element(by.cssContainingText('.overview-page .menu-card article header span', 'Licenses')),
      autoAssignLicensesText: element(by.cssContainingText('.status-block__item.auto-assign-licenses span[translate]', 'Auto-Assign Licenses')),
    },
  },
};

module.exports = OverviewPage;
