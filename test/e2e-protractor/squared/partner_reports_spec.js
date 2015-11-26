'use strict';

describe('Partner Reports', function () {
  var customer = 'Spark UC Reports Functional Tests';
  var e2eCustomer = 'Spark UC Reports E2E Tests';
  var time = 'Last Month';

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

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

    it('should verify report type buttons', function () {
      utils.expectText(reports.allTypes, 'All');
      utils.expectText(reports.engagement, 'Engagement');
      utils.expectText(reports.quality, 'Quality');
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
      reports.verifyOption(reports.timeSelect, 'Last Three Months');
    });

    it('should show all reports', function () {
      // active users
      reports.verifyDescription(time, reports.activeDescription, false);
      utils.expectIsDisplayed(reports.activeUserGraph);
      reports.verifyLegend('activeUsersdiv', 'Users');
      reports.verifyLegend('activeUsersdiv', 'Active Users');
      utils.expectIsNotDisplayed(reports.activeUsersTable);

      // active user population
      utils.expectIsDisplayed(reports.activePopulationGraph);

      // registered endpoints
      reports.scrollToElement(reports.registeredEndpointsTable);
      reports.verifyDescription(time, reports.endpointDescription, false);
      reports.confirmCustomerInTable(e2eCustomer, reports.registeredEndpointsTable, true);
      utils.expectIsDisplayed(reports.registeredEndpointsTable);

      // call metrics
      reports.verifyDescription(time, reports.metricsDescription, false);
      utils.expectIsDisplayed(reports.callMetricsGraph);

      // device media quality
      reports.scrollToElement(reports.mediaQualityGraph);
      utils.expectIsDisplayed(reports.mediaQualityGraph);
    });

    it('should be able to change customers', function () {
      utils.scrollTop();
      reports.clickFilter(reports.customerSelect);
      utils.click(reports.getOption(reports.customerSelect, customer));
    });

    it('should be able to change time period', function () {
      utils.scrollTop();
      reports.clickFilter(reports.timeSelect);
      utils.click(reports.getOption(reports.timeSelect, time));
    });

    it('should be able to show/hide most active users', function () {
      utils.expectIsDisplayed(reports.mostActiveButton);
      utils.expectText(reports.mostActiveButton, 'Show Most Active Users');
      utils.expectIsNotDisplayed(reports.activeUsersTable);
      utils.click(reports.mostActiveButton);

      utils.expectIsDisplayed(reports.activeUsersTable);
      utils.expectCountToBeGreater(reports.activeUsersTableContent, 0);
      utils.expectText(reports.mostActiveButton, 'Hide Most Active Users');
      utils.click(reports.mostActiveButton);

      utils.expectIsDisplayed(reports.mostActiveButton);
      utils.expectText(reports.mostActiveButton, 'Show Most Active Users');
      utils.expectIsNotDisplayed(reports.activeUsersTable);
    });

    it('should display new time and customer in engagement descriptions', function () {
      reports.verifyDescription(time, reports.activeDescription, true);
      reports.verifyDescription(time, reports.endpointDescription, true);
      reports.verifyDescription(time, reports.metricsDescription, true);
      reports.confirmCustomerInTable(customer, reports.registeredEndpointsTable, false);
    });

    it('should change to display only engagement reports', function () {
      utils.scrollTop();
      utils.click(reports.engagement);

      // engagement graphs
      utils.expectIsDisplayed(reports.activeUserGraph);
      utils.expectIsDisplayed(reports.activePopulationGraph);
      reports.scrollToElement(reports.registeredEndpointsTable);
      utils.expectIsDisplayed(reports.registeredEndpointsTable);

      // quality graphs
      utils.expectIsNotDisplayed(reports.callMetricsGraph);
      utils.expectIsNotDisplayed(reports.mediaQualityGraph);
    });

    it('should change to display only quality reports', function () {
      utils.scrollTop();
      utils.click(reports.quality);

      // engagement graphs
      utils.expectIsNotDisplayed(reports.activeUserGraph);
      utils.expectIsNotDisplayed(reports.activePopulationGraph);
      utils.expectIsNotDisplayed(reports.registeredEndpointsTable);

      // quality graphs
      utils.expectIsDisplayed(reports.callMetricsGraph);
      utils.expectIsDisplayed(reports.mediaQualityGraph);
    });

    it('should change to display all reports', function () {
      utils.scrollTop();
      utils.click(reports.allTypes);

      // engagement graphs
      utils.expectIsDisplayed(reports.activeUserGraph);
      utils.expectIsDisplayed(reports.activePopulationGraph);
      reports.scrollToElement(reports.registeredEndpointsTable);
      utils.expectIsDisplayed(reports.registeredEndpointsTable);

      // quality graphs
      utils.expectIsDisplayed(reports.callMetricsGraph);
      reports.scrollToElement(reports.mediaQualityGraph);
      utils.expectIsDisplayed(reports.mediaQualityGraph);
    });
  });
});
