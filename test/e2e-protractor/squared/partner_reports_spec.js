'use strict';

// Waiting for new page to go active before turning on tests
describe('Partner Reports', function () {
  describe('Log In', function () {
    it('should login', function () {
      login.login('partner-reports', '#/partner/overview');
    });
  });

  describe('Reports Page', function () {
    it('should navigate to partner reports page', function () {
      navigation.clickReports();
      utils.expectIsPresent(reports.pageTitle);
    });

    it('should verify report tabs', function () {
      reports.verifyReportTab('Engagement');
      reports.verifyReportTab('Quality');
    });

    it('should verify customer dropdown', function () {
      reports.enabledFilters(reports.customerSelect);
      reports.clickFilter(reports.customerSelect);
      reports.numOptions(reports.customerSelect).then(function (totalOptions) {
        utils.expectTruthy(totalOptions > 0);
      });
    });

    it('should verify time dropdown', function () {
      reports.enabledFilters(reports.timeSelect);
      reports.clickFilter(reports.timeSelect);
      reports.verifyOption(reports.timeSelect, 'Last Week');
      reports.verifyOption(reports.timeSelect, 'Last Month');
      reports.verifyOption(reports.timeSelect, 'Last 3 Months');
    });
  });

  describe('Engagement Tab', function () {
    it('should verify active users graph is visible', function () {
      utils.expectIsDisplayed(reports.activeUserGraph);
      reports.verifyLegend('activeUsersdiv', 'Users');
      reports.verifyLegend('activeUsersdiv', 'Active Users');
      utils.expectIsDisplayed(reports.noActiveUserData);
      utils.expectIsNotDisplayed(reports.activeUserRefresh);
    });

    it('should verify most active users is not visible', function () {
      utils.expectIsNotDisplayed(reports.mostActiveButton);
      utils.expectIsNotDisplayed(reports.activeUsersTable);
    });

    it('should verify registered endpoints table is visible', function () {
      utils.expectIsDisplayed(reports.registeredEndpointsTable);
      utils.expectIsNotDisplayed(reports.noEndpointData);
      utils.expectIsNotDisplayed(reports.noEndpointRefresh);
    });

    it('should verify active users population graph is visible', function () {
      utils.expectIsDisplayed(reports.activePopulationGraph);
      utils.expectIsNotDisplayed(reports.noActivePopulationData);
      utils.expectIsNotDisplayed(reports.activePopulationRefresh);
    });

    it('should not display quality tab graphs', function () {
      utils.expectIsNotDisplayed(reports.callMetricsGraph);
      utils.expectIsNotDisplayed(reports.mediaQualityGraph);
    });
  });

  describe('Quality Tab', function () {
    it('should change views to quality', function () {
      reports.clickTab('quality');

      utils.expectIsNotDisplayed(reports.activeUserGraph);
      utils.expectIsNotDisplayed(reports.mostActiveButton);
      utils.expectIsNotDisplayed(reports.registeredEndpointsTable);
      utils.expectIsNotDisplayed(reports.activePopulationGraph);
    });

    it('should verify call quality graph is visible', function () {
      utils.expectIsDisplayed(reports.callMetricsGraph);
      //  utils.expectIsDisplayed(reports.noMetricsData);
      //  utils.expectIsNotDisplayed(reports.metricsRefresh);
    });

    it('should verify call quality graph is visible', function () {
      utils.expectIsDisplayed(reports.mediaQualityGraph);
      //  utils.expectIsNotDisplayed(reports.noMediaData);
      utils.expectIsNotDisplayed(reports.mediaRefresh);
    });
  });

  describe('Filters', function () {
    var customer = 'Huron Int Test 2';
    var time = 'Last Month';

    it('should be able to change customers', function () {
      reports.clickFilter(reports.customerSelect);
      utils.click(reports.getOption(reports.customerSelect, customer));
    });

    it('should be able to show/hide most active users', function () {
      reports.clickTab('engagement');
      utils.expectIsDisplayed(reports.mostActiveButton);
      utils.expectText(reports.mostActiveButton, 'Show Most Active Users');
      utils.expectIsNotDisplayed(reports.activeUsersTable);
      utils.click(reports.mostActiveButton);

      utils.expectIsDisplayed(reports.activeUsersTable);
      //      utils.expectCountToBeGreater(reports.activeUsersTableContent, 0);
      //      utils.expectAllDisplayed(reports.activeCarousel);
      utils.expectText(reports.mostActiveButton, 'Hide Most Active Users');
      utils.click(reports.mostActiveButton);

      utils.expectIsDisplayed(reports.mostActiveButton);
      utils.expectText(reports.mostActiveButton, 'Show Most Active Users');
      utils.expectIsNotDisplayed(reports.activeUsersTable);
    });

    it('should be able to change time period', function () {
      utils.scrollTop();
      reports.clickFilter(reports.timeSelect);
      utils.click(reports.getOption(reports.timeSelect, time));
    });
  });
});
