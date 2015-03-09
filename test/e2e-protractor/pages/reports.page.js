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
  this.serviceSelect = element(by.id('serviceFilter'));
  this.customerSelect = element(by.id('customerFilter'));
  this.engagementRefreshDiv = element(by.id('engagementRefreshDiv'));

  this.verifyReportTab = function (tabName) {
    expect(element(by.cssContainingText('h4', tabName)).isDisplayed()).toBeTruthy();
    expect(element(by.id(tabName.toLowerCase() + "Report")).isPresent()).toBeTruthy();
    expect(element(by.id(tabName.toLowerCase() + "RefreshDiv")).isPresent()).toBeTruthy();
  };

  this.verifyOption = function (dropdown, option) {
    var opt = dropdown.all(by.cssContainingText('option', option)).first();
    expect(opt.isPresent()).toBeTruthy();
    expect(opt.isDisplayed()).toBeTruthy();
  };

  this.numOptions = function (dropdown) {
    return dropdown.all(by.css('option')).count();
  };
};

module.exports = ReportsPage;
