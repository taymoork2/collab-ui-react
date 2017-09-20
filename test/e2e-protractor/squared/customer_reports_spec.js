'use strict';

xdescribe('Customer Reports', function () {
  it('should login', function () {
    login.login('account-admin');
  });

  describe('Reports Page', function () {
    var time = ['Last 7 Days', 'Last 4 Weeks', 'Last 3 Months'];
    var lowerTime = ['last seven days', 'last four weeks', 'last three months'];

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
      utils.waitForText(reports.totalRoomsDescription, lowerTime[0]);
      utils.expectIsDisplayed(reports.totalRoomsGraph);

      // Active Users
      utils.expectIsDisplayed(reports.activeHeader);
      utils.expectIsDisplayed(reports.activeDescription);
      utils.expectIsDisplayed(reports.activeUsersChart);

      // Most Active Users
      utils.expectIsNotDisplayed(reports.mostActiveHeader);
      utils.expectIsNotDisplayed(reports.mostActiveSearch);
      utils.expectIsNotDisplayed(reports.activeUsersTable);
      utils.expectIsNotDisplayed(reports.mostActiveCarousel);

      // Files Shared
      utils.expectIsDisplayed(reports.filesSharedHeader);
      utils.expectIsDisplayed(reports.filesSharedDescription);
      utils.waitForText(reports.filesSharedDescription, lowerTime[0]);
      utils.expectIsDisplayed(reports.filesSharedDiv);

      // Registered Endpoints
      utils.expectIsDisplayed(reports.endpointsHeader);
      utils.expectIsDisplayed(reports.customerEndpointsDescription);
      utils.waitForText(reports.customerEndpointsDescription, lowerTime[0]);
      utils.expectIsDisplayed(reports.endpointFilter);
      utils.expectIsDisplayed(reports.endpointsDiv);

      // Device Media Quality
      utils.expectIsDisplayed(reports.mediaHeader);
      utils.expectIsDisplayed(reports.mediaDescription);
      utils.expectIsDisplayed(reports.mediaFilter);
      utils.expectIsDisplayed(reports.mediaQualityGraph);

      // Call Metrics
      utils.expectIsDisplayed(reports.metricsHeader);
      utils.expectIsDisplayed(reports.metricsDescription);
      utils.expectIsDisplayed(reports.callMetricsGraph);
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
      utils.expectIsDisplayed(reports.activeDescription);
      utils.expectIsDisplayed(reports.activeUsersChart);

      utils.expectIsDisplayed(reports.filesSharedHeader);
      utils.expectIsDisplayed(reports.filesSharedDescription);
      utils.expectIsDisplayed(reports.filesSharedDiv);

      utils.expectIsDisplayed(reports.endpointsHeader);
      utils.expectIsDisplayed(reports.customerEndpointsDescription);
      utils.expectIsDisplayed(reports.endpointFilter);
      utils.expectIsDisplayed(reports.endpointsDiv);

      // quality graphs
      utils.expectIsNotDisplayed(reports.mediaQualityGraph);
      utils.expectIsNotDisplayed(reports.callMetricsGraph);
    });

    it('should change to display only quality reports', function () {
      utils.click(reports.quality);

      // engagement graphs
      utils.expectIsNotDisplayed(reports.totalRoomsGraph);
      utils.expectIsNotDisplayed(reports.activeUsersChart);
      utils.expectIsNotDisplayed(reports.filesSharedDiv);
      utils.expectIsNotDisplayed(reports.endpointsDiv);

      // quality graphs
      utils.expectIsDisplayed(reports.mediaHeader);
      utils.expectIsDisplayed(reports.mediaDescription);
      utils.expectIsDisplayed(reports.mediaFilter);
      utils.expectIsDisplayed(reports.mediaQualityGraph);

      utils.expectIsDisplayed(reports.metricsHeader);
      utils.expectIsDisplayed(reports.metricsDescription);
      utils.expectIsDisplayed(reports.callMetricsGraph);
      reports.metricsDataPresent(false);
    });

    it('should return to all reports', function () {
      utils.click(reports.allTypes);

      // Total Rooms
      utils.expectIsDisplayed(reports.totalRoomsHeader);
      utils.expectIsDisplayed(reports.totalRoomsDescription);
      utils.waitForText(reports.totalRoomsDescription, lowerTime[1]);
      utils.expectIsDisplayed(reports.totalRoomsGraph);

      // Active Users
      utils.expectIsDisplayed(reports.activeHeader);
      utils.expectIsDisplayed(reports.activeDescription);
      utils.expectIsDisplayed(reports.activeUsersChart);

      // Most Active Users
      utils.expectIsNotDisplayed(reports.mostActiveHeader);
      utils.expectIsNotDisplayed(reports.mostActiveSearch);
      utils.expectIsNotDisplayed(reports.activeUsersTable);
      utils.expectIsNotDisplayed(reports.mostActiveCarousel);

      // Files Shared
      utils.expectIsDisplayed(reports.filesSharedHeader);
      utils.expectIsDisplayed(reports.filesSharedDescription);
      utils.waitForText(reports.filesSharedDescription, lowerTime[1]);
      utils.expectIsDisplayed(reports.filesSharedDiv);

      // Registered Endpoints
      utils.expectIsDisplayed(reports.endpointsHeader);
      utils.expectIsDisplayed(reports.customerEndpointsDescription);
      utils.waitForText(reports.customerEndpointsDescription, lowerTime[1]);
      utils.expectIsDisplayed(reports.endpointFilter);
      utils.expectIsDisplayed(reports.endpointsDiv);

      // Device Media Quality
      utils.expectIsDisplayed(reports.mediaHeader);
      utils.expectIsDisplayed(reports.mediaDescription);
      utils.expectIsDisplayed(reports.mediaFilter);
      utils.expectIsDisplayed(reports.mediaQualityGraph);

      // Call Metrics
      utils.expectIsDisplayed(reports.metricsHeader);
      utils.expectIsDisplayed(reports.metricsDescription);
      utils.expectIsDisplayed(reports.callMetricsGraph);
      reports.metricsDataPresent(false);
    });
  });
});
