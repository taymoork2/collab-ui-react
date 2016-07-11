'use strict';

/* global TIMEOUT */
/* global LONG_TIMEOUT */

var ReportsPage = function () {
  this.pageTitle = element(by.cssContainingText('span', 'Reports'));
  this.timeSelect = element(by.id('timeFilter'));
  this.timeSelectCare = element(by.id('timeFilterCare'));
  this.customerSelect = element(by.id('customerFilter'));
  this.allTypes = element(by.id('allReports'));
  this.engagement = element(by.id('engagementReports'));
  this.quality = element(by.id('qualityReports'));
  this.reportsCareTab = element(by.css('a[href="#/reports/care"]'));

  // Total Rooms
  this.totalRoomsHeader = element(by.cssContainingText('.report-section-header', 'Total Rooms'));
  this.totalRoomsDescription = element(by.css('.customer-avg-rooms')).element(by.css('.report-description'));
  this.totalRoomsGraph = element(by.id('avgRoomsdiv'));

  // active user
  this.activeHeader = element(by.cssContainingText('.report-section-header', 'Active Users'));
  this.partnerActiveHeader = element(by.id('activeUser')).element(by.cssContainingText('article header h4', 'Active Users'));
  this.activeCustomerDescription = element(by.css('.customer-active-user')).element(by.css('.report-description'));
  this.activePartnerDescription = element(by.id('activeUser')).element(by.css('article section p'));
  this.activeUsers = element(by.id('activeUsersdiv'));

  // most active users
  this.activeUsersTable = element(by.css('.active-users-table'));
  this.showHideActiveUsers = element(by.css('a.report-sides')).all(by.css('span'));
  this.mostActiveCarousel = element(by.id('activeCarousel'));
  this.mostActiveSearch = element(by.css('.active-search'));
  this.mostActiveDescription = element(by.css('.active-table')).element(by.css('.report-description'));
  this.mostActiveHeader = element(by.css('.active-table')).element(by.css('.report-section-header'));
  this.partnermostActiveHeader = element(by.css('.card-section-content div h4'));
  this.partnerMostActiveDescription = element(by.css('.card-section-content div p'));
  this.showmostActiveButton = element(by.id('showActiveUsers'));
  this.hidemostActiveButton = element(by.id('hideActiveUsrs'));
  this.activeUsersTableContent = element.all(by.repeater('user in nav.mostActiveUsers'));

  // Files Shared
  this.filesSharedHeader = element(by.cssContainingText('.report-section-header', 'Files Shared'));
  this.filesSharedDescription = element(by.css('.customer-files-shared')).element(by.css('.report-description'));
  this.filesSharedDiv = element(by.id('filesSharedDiv'));

  // active user population
  this.activePopulationHeader = element(by.id('userPopulation')).element(by.cssContainingText('article header h4', 'Active User Population by Company'));
  this.activePopulationDescription = element(by.id('activeUserPopulationDiv')).element(by.css('p'));
  this.activePopulationGraph = element(by.id('activeUserPopulationChart'));

  // registered endpoints graph
  this.endpointsHeader = element(by.cssContainingText('.report-section-header', 'Registered Endpoints'));
  this.customerEndpointsDescription = element(by.css('.customer-devices')).element(by.css('.report-description'));
  this.endpointFilter = element(by.id('deviceFilter'));
  this.endpointsDiv = element(by.id('devicesDiv'));

  // registered endpoints table
  this.regEndpointHeader = element(by.id('reg-endpoints')).element(by.cssContainingText('article header h4', 'Registered Endpoints'));
  this.endpointDescription = element(by.id('reg-endpoints')).element(by.css('article section p'));
  this.registeredEndpointsTable = element(by.css('.registeredEndpoints')).element(by.css('.table'));

  // call metrics
  this.metricsHeader = element(by.cssContainingText('.report-section-header', 'Call Metrics'));
  this.customerMetricsDescription = element(by.css('.call-metrics-customer')).element(by.css('.report-description'));
  this.metricsGraphDiv = element(by.id('metricsGraphDiv'));
  this.metricsData = element.all(by.css('.metrics-display'));
  this.partnerMetricsHeader = element(by.id('callMetrics')).element(by.cssContainingText('article header h4', 'Call Metrics'));
  this.callMetricsGraph = element(by.id('callMetricsDiv'));
  this.partnerMetricsDescription = element(by.id('callMetrics')).element(by.css('article section p'));

  // media quality
  this.mediaHeader = element(by.cssContainingText('.report-section-header', 'Device Media Quality'));
  this.customerMediaDescription = element.all(by.css('.customer-media')).last().element(by.css('.report-description'));
  this.mediaFilter = element(by.id('mediaFilter'));
  this.mediaQualityDiv = element(by.id('mediaQualityDiv'));
  this.partnerMediaHeader = element(by.id('mediaQuality')).element(by.cssContainingText('.report-section-header', 'Device Media Quality'));
  this.mediaQualityGraph = element(by.id('mediaQualityDiv'));
  this.mediaDescription = element(by.id('mediaQuality')).element(by.css('article section p'));

  this.showHideActiveVisibility = function (show, hide, partner) {
    if (partner) {
      if (show) {
        utils.expectIsDisplayed(this.showmostActiveButton);
      } else {
        utils.expectIsNotDisplayed(this.showmostActiveButton);
      }

      if (hide) {
        utils.expectIsDisplayed(this.hidemostActiveButton);
      } else {
        utils.expectIsNotDisplayed(this.hidemostActiveButton);
      }
    } else {
      this.showHideActiveUsers.each(function (element, index) {
        var test = show;
        if (index === 1) {
          test = hide;
        }

        if (test) {
          utils.expectIsDisplayed(element);
        } else {
          utils.expectIsNotDisplayed(element);
        }
      });
    }
  };

  this.metricsDataPresent = function (state) {
    var text = ['Total Calls', 'Call Minutes', 'Call Failure Rate'];
    this.metricsData.each(function (element, index) {
      if (state) {
        utils.expectIsNotPresent(element);
      } else {
        utils.expectIsPresent(element);
        utils.expectIsPresent(element.element(by.css('.metrics-numeral')));
        utils.expectIsPresent(element.element(by.css('.metrics-text')));
        utils.expectTextToBeSet(element.element(by.css('.metrics-text')), text[index]);
      }
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
