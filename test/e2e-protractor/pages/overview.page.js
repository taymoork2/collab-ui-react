'use strict';

var OverviewPage = {
  cards: {
    licenses: {
      headerIcon: element(by.css('.overview-page .menu-card article header .icon.icon-circle-user')),
      autoAssignLicensesStatusIndicator: element(by.css('.status-block__item.auto-assign-licenses .status-indicator.disabled')),
      autoAssignLicensesText: element(by.cssContainingText('.status-block__item.auto-assign-licenses span[translate]', 'Auto-Assign Licenses')),
      settingsIcon: element(by.css('.status-block__item.auto-assign-licenses > a > i.icon-settings')),
    },
  },
  notificationItems: {
    autoAssign: {
      bodyText: element(by.cssContainingText('.overview-page .side-info-card article section .notification-style .text', 'with the Auto-Assign template')),
      link: element(by.cssContainingText('.overview-page .side-info-card article section .notification-style a', 'Set Up Now')),
    },
  },
};

module.exports = OverviewPage;
