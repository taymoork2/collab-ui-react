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

  // active user
  this.noActiveUserData = element(by.css('.active-user')).element(by.css('.no-data-center'));
  this.mostActiveButton = element(by.css('.most-active'));
  this.activeUsersTable = element(by.css('.active-users-table'));
  this.activeUsersTableContent = element.all(by.repeater('user in nav.mostActiveUsers'));
  this.activeCarousel = element(by.id('activeCarousel')).all(by.css('button'));
  this.activeUserGraph = element(by.id('activeUsersdiv')).all(by.css('div')).first();
  this.activeUserRefresh = element(by.id('activeUsersRefreshDiv'));

  // active user population
  this.activePopulationGraph = element(by.id('activeUserPopulationChart')).all(by.css('div')).first();
  this.noActivePopulationData = element(by.css('.active-user-population')).element(by.css('.no-data-center'));
  this.activePopulationRefresh = element(by.id('activeUserPopulationRefreshDiv'));

  // registered endpoints
  this.registeredEndpointsTable = element(by.css('.registeredEndpoints')).element(by.css('.table'));
  this.noEndpointData = element(by.css('.registeredEndpoints')).element(by.css('.no-data-center'));
  this.noEndpointRefresh = element(by.id('endpointRefreshDiv'));

  // call metrics
  this.callMetricsGraph = element(by.id('callMetricsDiv')).all(by.css('div')).first();
  this.noMetricsData = element(by.css('.call-metrics')).element(by.css('.no-data-center'));
  this.metricsRefresh = element(by.id('callMetricsRefreshDiv'));

  // media quality
  this.mediaQualityGraph = element(by.id('mediaQualityDiv')).all(by.css('div')).first();
  this.noMediaData = element(by.css('.media-quality')).element(by.css('.no-data-center'));
  this.mediaRefresh = element(by.id('mediaQualityRefreshDiv'));

  this.verifyReportTab = function (tabName) {
    expect(element(by.id(tabName.toLowerCase() + "Tab")).isPresent()).toBeTruthy();
    expect(element(by.id(tabName.toLowerCase() + "Tab")).element(by.cssContainingText('h4', tabName)).isDisplayed()).toBeTruthy();
    expect(element(by.id(tabName.toLowerCase() + "Report")).isPresent()).toBeTruthy();
  };

  this.verifyOption = function (dropdown, option) {
    utils.wait(dropdown.element(by.css('.select-dropdown')));
    var opt = dropdown.all(by.cssContainingText('li', option)).first();
    expect(opt.isPresent()).toBeTruthy();
    expect(opt.isDisplayed()).toBeTruthy();
  };

  this.enabledFilters = function (dropdown) {
    return browser.wait(function () {
      return dropdown.element(by.css('.select-toggle')).getAttribute('disabled').then(function (enabled) {
        return enabled === null;
      });
    }, 60000, 'Waiting for Not Disabled');
  };

  this.clickFilter = function (dropdown) {
    utils.click(dropdown.all(by.css('div')).first());
  };

  this.numOptions = function (dropdown) {
    utils.wait(dropdown.element(by.css('.select-dropdown')));
    return dropdown.all(by.css('li')).count();
  };

  this.verifyLegend = function (graph, text) {
    utils.expectIsPresent(element(by.id(graph)).element(by.cssContainingText('text', text)));
  };

  this.getOption = function (select, text) {
    return select.all(by.cssContainingText('li', text)).first();
  };

  this.clickTab = function (tabName) {
    utils.click(element(by.id(tabName.toLowerCase() + "Tab")));
  };
};

module.exports = ReportsPage;
