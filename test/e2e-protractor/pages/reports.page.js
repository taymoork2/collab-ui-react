'use strict';

/* global TIMEOUT */
/* global LONG_TIMEOUT */

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
  this.allTypes = element(by.id('allReports'));
  this.engagement = element(by.id('engagementReports'));
  this.quality = element(by.id('qualityReports'));

  // active user
  this.showmostActiveButton = element(by.id('showActiveUsers'));
  this.hidemostActiveButton = element(by.id('hideActiveUsrs'));
  this.activeUsersTable = element(by.css('.active-users-table'));
  this.activeUsersTableContent = element.all(by.repeater('user in nav.mostActiveUsers'));
  this.activeCarousel = element(by.id('activeCarousel')).all(by.css('button'));
  this.activeUserGraph = element(by.id('activeUsersdiv')).all(by.css('div')).first();
  this.activeUserRefresh = element(by.id('activeUsersRefreshDiv'));
  this.activeDescription = element(by.id('activeUserDesc'));

  // active user population
  this.activePopulationGraph = element(by.id('activeUserPopulationChart')).all(by.css('div')).first();
  this.activePopulationRefresh = element(by.id('activeUserPopulationRefreshDiv'));
  this.activePopulationDescription = '.active-user-population';

  // registered endpoints
  this.registeredEndpointsTable = element(by.css('.registeredEndpoints')).element(by.css('.table'));
  this.noEndpointRefresh = element(by.id('endpointRefreshDiv'));
  this.endpointDescription = '.registeredEndpoints';

  // call metrics
  this.callMetricsGraph = element(by.id('callMetricsDiv')).all(by.css('div')).first();
  this.metricsRefresh = element(by.id('callMetricsRefreshDiv'));
  this.metricsDescription = '.call-metrics';

  // media quality
  this.mediaQualityGraph = element(by.id('mediaQualityDiv')).all(by.css('div')).first();
  this.mediaRefresh = element(by.id('mediaQualityRefreshDiv'));
  this.mediaDescription = '.media-quality';

  this.scrollToElement = function (element) {
    return element.getLocation().then(function (location) {
      return browser.executeScript('window.scrollTo(0,' + (location.y + 100) + ');');
    });
  };

  this.verifyNoData = function (section) {
    utils.expectIsPresent(element(by.css(section)).element(by.css('.no-data-center')));
  };

  this.verifyOption = function (dropdown, option) {
    utils.wait(dropdown.element(by.css('.dropdown-menu')));
    var opt = dropdown.all(by.cssContainingText('li', option)).first();
    expect(opt.isPresent()).toBeTruthy();
    expect(opt.isDisplayed()).toBeTruthy();
  };

  this.enabledFilters = function (dropdown) {
    return browser.wait(function () {
      return dropdown.element(by.css('.select-toggle')).getAttribute('disabled').then(function (enabled) {
        return enabled === null;
      });
    }, LONG_TIMEOUT, 'Waiting for Not Disabled');
  };

  this.clickFilter = function (dropdown) {
    utils.click(dropdown.all(by.css('div')).first());
  };

  this.numOptions = function (dropdown) {
    utils.wait(dropdown.element(by.css('.dropdown-menu')));
    return dropdown.all(by.css('li')).count();
  };

  this.verifyLegend = function (graph, text) {
    utils.expectIsPresent(element(by.id(graph)).element(by.css('.amChartsLegend')).element(by.cssContainingText('tspan', text)));
  };

  this.getOption = function (select, text) {
    return select.all(by.cssContainingText('li', text)).first();
  };

  this.clickTab = function (tabName) {
    utils.click(element(by.id(tabName.toLowerCase() + "Tab")));
  };

  this.confirmCustomerInTable = function (customer, table, bool) {
    return table.element(by.cssContainingText('.customer-data', customer)).isPresent(function (present) {
      expect(present).toBe(bool);
    });
  };
};

module.exports = ReportsPage;
