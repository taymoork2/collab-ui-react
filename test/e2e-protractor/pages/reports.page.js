'use strict';

var ReportsPage = function () {
  // customer reports
  this.entitlements = element(by.id('avgEntitlementsdiv'));
  this.calls = element(by.id('avgCallsdiv'));
  this.conversations = element(by.id('avgConversationsdiv'));
  this.activeUsers = element(by.id('activeUsersdiv'));
  this.onboarding = element(by.id('onboardingFunnelDiv'));
  this.convOneOnOne = element(by.id('convOneOnOnediv'));
  this.convGroup = element(by.id('convGroupdiv'));
  this.calls = element(by.id('callsdiv'));
  this.callsAvgDuration = element(by.id('callsAvgDurationdiv'));
  this.contentShared = element(by.id('contentShareddiv'));
  this.contentShareSizes = element(by.id('contentShareSizesdiv'));

  this.entitlementsRefresh = element(by.id('avg-entitlements-refresh'));
  this.callsRefresh = element(by.id('avg-calls-refresh'));
  this.conversationsRefresh = element(by.id('avg-conversations-refresh'));
  this.activeUsersRefresh = element(by.id('active-users-refresh'));

  this.refreshButton = element(by.id('reports-click-div'));
  this.refreshData = element(by.id('reportsRefreshData'));
  this.reloadedTime = element(by.id('lastReloadedTime'));

  // partner reports
  this.pageTitle = element(by.cssContainingText('span', 'Reports'));
  this.timeSelect = element(by.id('timeFilter'));
  this.customerSelect = element(by.id('customerFilter'));
  this.noData = element(by.css('.no-data-center'));
  this.mostActiveButton = element(by.css('.most-active-btn'));
  this.activeUsersTable = element(by.css('.active-users-table'));
  this.activeUsersTableContent = element.all(by.repeater('user in nav.mostActiveUsers'));
  this.activeCarousel = element(by.id('activeCarousel')).all(by.css('button'));
  this.activeUserGraph = element(by.id('activeUsersdiv')).all(by.css('div')).first();
  this.activeUserRefresh = element(by.id('activeUsersRefreshDiv'));

  this.verifyReportTab = function (tabName) {
    expect(element(by.cssContainingText('h4', tabName)).isDisplayed()).toBeTruthy();
    expect(element(by.id(tabName.toLowerCase() + "Report")).isPresent()).toBeTruthy();
  };

  this.verifyOption = function (dropdown, option) {
    var opt = dropdown.all(by.cssContainingText('option', option)).first();
    expect(opt.isPresent()).toBeTruthy();
    expect(opt.isDisplayed()).toBeTruthy();
  };

  this.numOptions = function (dropdown) {
    return dropdown.all(by.css('option')).count();
  };

  this.verifyLegend = function (text) {
    utils.expectIsPresent(element(by.cssContainingText('text', text)));
  };

  this.getOptions = function (select, index) {
    return select.all(by.css('option')).get(index);
  };
};

module.exports = ReportsPage;
