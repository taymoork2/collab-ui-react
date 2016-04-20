'use strict';

describe('Customer Reports', function () {

  it('should login', function () {
    login.login('pbr-admin');
  });

  describe('Reports Page', function () {
    var time = ['Last Week', 'Last Month', 'Last Three Months'];
    var lowerTime = ['last week', 'last month', 'last three months'];

    it('should navigate to customer reports page', function () {
      navigation.clickReports();
      utils.expectIsPresent(reports.pageTitle);
    });

    it('should verify report type buttons', function () {
      utils.expectText(reports.allTypes, 'All');
      utils.expectText(reports.engagement, 'Engagement');
      utils.expectText(reports.quality, 'Quality');
    });

    it('should verify time dropdown', function () {
      reports.enabledFilters(reports.timeSelect);
      reports.clickFilter(reports.timeSelect);
      for (var i = 0; i < time.length; i++) {
        reports.verifyOption(reports.timeSelect, time[i]);
      }
      reports.clickFilter(reports.timeSelect);
    });

    it('should show all reports', function () {
      // Total Rooms
      utils.expectIsDisplayed(reports.totalRoomsHeader);
      utils.expectIsDisplayed(reports.totalRoomsDescription);
      utils.expectTextToBeSet(reports.totalRoomsDescription, lowerTime[0]);
      utils.expectIsDisplayed(reports.totalRoomsGraph);

      // Active Users
      utils.expectIsDisplayed(reports.activeHeader);
      utils.expectIsDisplayed(reports.activeCustomerDescription);
      utils.expectTextToBeSet(reports.activeCustomerDescription, lowerTime[0]);
      utils.expectIsDisplayed(reports.activeUsers);

      // Most Active Users
      utils.expectIsNotDisplayed(reports.mostActiveHeader);
      utils.expectIsNotDisplayed(reports.mostActiveSearch);
      utils.expectIsNotDisplayed(reports.activeUsersTable);
      utils.expectIsNotDisplayed(reports.mostActiveCarousel);

      // Files Shared
      utils.expectIsDisplayed(reports.filesSharedHeader);
      utils.expectIsDisplayed(reports.filesSharedDescription);
      utils.expectTextToBeSet(reports.filesSharedDescription, lowerTime[0]);
      utils.expectIsDisplayed(reports.filesSharedDiv);

      // Registered Endpoints
      utils.expectIsDisplayed(reports.endpointsHeader);
      utils.expectIsDisplayed(reports.customerEndpointsDescription);
      utils.expectTextToBeSet(reports.customerEndpointsDescription, lowerTime[0]);
      utils.expectIsDisplayed(reports.endpointFilter);
      utils.expectIsDisplayed(reports.endpointsDiv);

      // Device Media Quality
      utils.expectIsDisplayed(reports.mediaHeader);
      utils.expectIsDisplayed(reports.customerMediaDescription);
      utils.expectIsDisplayed(reports.mediaFilter);
      utils.expectIsDisplayed(reports.mediaQualityDiv);

      // Call Metrics
      utils.expectIsDisplayed(reports.metricsHeader);
      utils.expectIsDisplayed(reports.customerMetricsDescription);
      utils.expectIsDisplayed(reports.metricsGraphDiv);
      reports.metricsDataPresent(false);
    });

    it('should be able to change time period', function () {
      reports.clickFilter(reports.timeSelect);
      utils.click(reports.getOption(reports.timeSelect, time[1]));
    });

    it('should change to display only engagement reports', function () {
      utils.click(reports.engagement);

      // engagement graphs
      utils.expectIsDisplayed(reports.totalRoomsHeader);
      utils.expectIsDisplayed(reports.totalRoomsDescription);
      utils.expectIsDisplayed(reports.totalRoomsGraph);

      utils.expectIsDisplayed(reports.activeHeader);
      utils.expectIsDisplayed(reports.activeCustomerDescription);
      utils.expectIsDisplayed(reports.activeUsers);

      utils.expectIsDisplayed(reports.filesSharedHeader);
      utils.expectIsDisplayed(reports.filesSharedDescription);
      utils.expectIsDisplayed(reports.filesSharedDiv);

      utils.expectIsDisplayed(reports.endpointsHeader);
      utils.expectIsDisplayed(reports.customerEndpointsDescription);
      utils.expectIsDisplayed(reports.endpointFilter);
      utils.expectIsDisplayed(reports.endpointsDiv);

      // quality graphs
      utils.expectIsNotDisplayed(reports.mediaQualityDiv);
      utils.expectIsNotDisplayed(reports.metricsGraphDiv);
    });

    it('should change to display only quality reports', function () {
      utils.click(reports.quality);

      // engagement graphs
      utils.expectIsNotDisplayed(reports.totalRoomsGraph);
      utils.expectIsNotDisplayed(reports.activeUsers);
      utils.expectIsNotDisplayed(reports.filesSharedDiv);
      utils.expectIsNotDisplayed(reports.endpointsDiv);

      // quality graphs
      utils.expectIsDisplayed(reports.mediaHeader);
      utils.expectIsDisplayed(reports.customerMediaDescription);
      utils.expectIsDisplayed(reports.mediaFilter);
      utils.expectIsDisplayed(reports.mediaQualityDiv);

      utils.expectIsDisplayed(reports.metricsHeader);
      utils.expectIsDisplayed(reports.customerMetricsDescription);
      utils.expectIsDisplayed(reports.metricsGraphDiv);
      reports.metricsDataPresent(false);
    });

    it('should return to all reports', function () {
      utils.click(reports.allTypes);

      // Total Rooms
      utils.expectIsDisplayed(reports.totalRoomsHeader);
      utils.expectIsDisplayed(reports.totalRoomsDescription);
      utils.expectTextToBeSet(reports.totalRoomsDescription, lowerTime[1]);
      utils.expectIsDisplayed(reports.totalRoomsGraph);

      // Active Users
      utils.expectIsDisplayed(reports.activeHeader);
      utils.expectIsDisplayed(reports.activeCustomerDescription);
      utils.expectTextToBeSet(reports.activeCustomerDescription, lowerTime[1]);
      utils.expectIsDisplayed(reports.activeUsers);

      // Most Active Users
      utils.expectIsNotDisplayed(reports.mostActiveHeader);
      utils.expectIsNotDisplayed(reports.mostActiveSearch);
      utils.expectIsNotDisplayed(reports.activeUsersTable);
      utils.expectIsNotDisplayed(reports.mostActiveCarousel);

      // Files Shared
      utils.expectIsDisplayed(reports.filesSharedHeader);
      utils.expectIsDisplayed(reports.filesSharedDescription);
      utils.expectTextToBeSet(reports.filesSharedDescription, lowerTime[1]);
      utils.expectIsDisplayed(reports.filesSharedDiv);

      // Registered Endpoints
      utils.expectIsDisplayed(reports.endpointsHeader);
      utils.expectIsDisplayed(reports.customerEndpointsDescription);
      utils.expectTextToBeSet(reports.customerEndpointsDescription, lowerTime[1]);
      utils.expectIsDisplayed(reports.endpointFilter);
      utils.expectIsDisplayed(reports.endpointsDiv);

      // Device Media Quality
      utils.expectIsDisplayed(reports.mediaHeader);
      utils.expectIsDisplayed(reports.customerMediaDescription);
      utils.expectIsDisplayed(reports.mediaFilter);
      utils.expectIsDisplayed(reports.mediaQualityDiv);

      // Call Metrics
      utils.expectIsDisplayed(reports.metricsHeader);
      utils.expectIsDisplayed(reports.customerMetricsDescription);
      utils.expectIsDisplayed(reports.metricsGraphDiv);
      reports.metricsDataPresent(false);
    });

  });
});
