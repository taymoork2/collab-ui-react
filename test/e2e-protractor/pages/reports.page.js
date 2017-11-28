'use strict';

/* global LONG_TIMEOUT */

var ReportsPage = function () {
  this.pageTitle = element(by.cssContainingText('span', 'Reports'));
  this.timeSelect = element(by.id('timeFilter'));
  this.timeSelectCare = element(by.id('timeFilterCare'));
  this.customerSelect = element(by.id('customerFilter'));
  this.allTypes = element(by.id('allReports'));
  this.engagement = element(by.id('engagementReports'));
  this.quality = element(by.id('qualityReports'));
  this.mediaTypeAllFilter = element(by.cssContainingText('.customer-report-filter', 'All Tasks'));
  this.mediaTypeChatFilter = element(by.cssContainingText('.customer-report-filter', 'Chats'));
  this.mediaTypeCallbackFilter = element(by.cssContainingText('.customer-report-filter', 'Callbacks'));
  // Total Rooms
  this.totalRoomsHeader = element(by.cssContainingText('.report-section-header', 'Total Rooms'));
  this.totalRoomsDescription = element(by.id('avgRooms')).element(by.css('article section p'));
  this.totalRoomsGraph = element(by.id('avgRoomsChart'));

  // active user
  this.activeHeader = element(by.cssContainingText('.report-section-header', 'Active Users'));
  this.activeDescription = element(by.id('activeUsers')).element(by.css('article section p'));
  this.activeUsersChart = element(by.id('activeUsersChart'));

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
  this.filesSharedDescription = element(by.id('filesShared')).element(by.css('article section p'));
  this.filesSharedDiv = element(by.id('filesSharedChart'));

  // active user population
  this.activePopulationHeader = element(by.id('userPopulation')).element(by.cssContainingText('.report-section-header', 'Active User Population by Company'));
  this.activePopulationDescription = element(by.id('userPopulation')).element(by.css('p'));
  this.activePopulationGraph = element(by.id('userPopulationChart'));

  // registered endpoints graph/table
  this.endpointsHeader = element(by.cssContainingText('.report-section-header', 'Registered Endpoints'));
  this.customerEndpointsDescription = element(by.id('devices')).element(by.css('article section p'));
  this.endpointFilter = element(by.id('devicesFilter'));
  this.endpointsDiv = element(by.id('devicesChart'));
  this.endpointDescription = element(by.id('reg-endpoints')).element(by.css('article section p'));
  this.registeredEndpointsTable = element(by.id('reg-endpoints')).element(by.css('table.table'));

  // call metrics
  this.metricsHeader = element(by.cssContainingText('.report-section-header', 'Call Metrics'));
  this.metricsData = element.all(by.css('.metrics-display'));
  this.callMetricsGraph = element(by.id('callMetricsChart'));
  this.metricsDescription = element(by.id('callMetrics')).element(by.css('article section p'));

  // media quality
  this.mediaHeader = element(by.cssContainingText('.report-section-header', 'Device Media Quality'));
  this.mediaFilter = element(by.id('mediaQualityFilter'));
  this.mediaQualityGraph = element(by.id('mediaQualityChart'));
  this.mediaDescription = element(by.id('mediaQuality')).element(by.css('article section p'));

  // Task Incoming
  this.taskIncomingHeader = element(by.cssContainingText('.report-section-header', 'Total Incoming Chats'));
  this.taskIncomingDescription = element(by.cssContainingText('.report-description', 'This chart represents the total number of incoming chats for today. Hover over the chart to see the details.'));
  this.taskIncomingGraph = element(by.id('taskIncomingdiv'));

  // Task Time
  this.taskTimeHeader = element(by.cssContainingText('.report-section-header', 'Chat Completion Time'));
  this.taskTimeDescription = element(by.cssContainingText('.report-description', 'This chart represents the average time taken to complete a chat for yesterday. Hover over the chart to see the details.'));
  this.taskTimeGraph = element(by.id('taskTimeDiv'));

  // Task Aggregate
  this.taskAggregateHeader = element(by.cssContainingText('.report-section-header', 'Aggregated Chats'));
  this.taskAggregateDescription = element(by.cssContainingText('.report-description', 'This chart represents the number of active and queued chats aggregated today. Hover over the chart to see the details.'));
  this.taskAggregateGraph = element(by.id('taskAggregateDiv'));

  // Average CSAT
  this.averageCsatHeader = element(by.cssContainingText('.report-section-header', 'Customer Satisfaction'));
  this.averageCsatDescription = element(by.cssContainingText('.report-description', 'This chart represents the average customer satisfaction rating for today. Hover over the chart to see the details.'));
  this.averageCsatGraph = element(by.id('averageCsatDiv'));

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
        utils.waitForText(element.element(by.css('.metrics-text')), text[index]);
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
    utils.click(element(by.id(tabName.toLowerCase() + 'Tab')));
  };

  this.confirmCustomerInTable = function (customer, table, bool) {
    return table.element(by.cssContainingText('.customer-data', customer)).isPresent(function (present) {
      expect(present).toBe(bool);
    });
  };
};

module.exports = ReportsPage;
