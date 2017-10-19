'use strict';

var OverviewPage = {
  cards: {
    licenses: {
      headerText: element(by.cssContainingText('.overview-page .menu-card article header span', 'Licenses')),
      autoAssignLicensesText: element(by.cssContainingText('.status-block__item.auto-assign-licenses span[translate]', 'Auto-Assign Licenses')),
      settingsIcon: element(by.css('.status-block__item.auto-assign-licenses > a > i.icon-settings')),
    },
  },
};

module.exports = OverviewPage;
