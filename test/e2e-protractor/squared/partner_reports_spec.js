'use strict';

// Waiting for new page to go active before turning on tests
describe('Partner Reports', function () {
  describe('Log In', function () {
    var squaredPartner = {
      'user': 'admin@squareduc-partner.com',
      'pass': 'Cisco123!'
    };

    xit('should login', function () {
      login.loginThroughGui(squaredPartner.user, squaredPartner.pass);
    });
  });

  describe('Reports Page', function () {
    xit('should navigate to partner reports page', function () {
      navigation.clickNewReports();
      utils.expectIsPresent(reports.pageTitle);
    });

    xit('should verify report tabs', function () {
      reports.verifyReportTab('Engagement');
      reports.verifyReportTab('Quality');
    });

    xit('should verify customer dropdown', function () {
      utils.waitUntilEnabled(reports.customerSelect);
      utils.click(reports.customerSelect);
      reports.numOptions(reports.customerSelect).then(function (totalOptions) {
        utils.expectTruthy(totalOptions > 0);
        if (totalOptions > 9) {
          reports.verifyOption(reports.customerSelect, '5 Most Engaged');
          reports.verifyOption(reports.customerSelect, '5 Least Engaged');
          reports.verifyOption(reports.customerSelect, '5 Highest Quality');
          reports.verifyOption(reports.customerSelect, '5 Lowest Quality');
        }
      });
    });

    xit('should verify time dropdown', function () {
      utils.click(reports.timeSelect);
      reports.verifyOption(reports.timeSelect, 'Last Week');
      reports.verifyOption(reports.timeSelect, 'Last Month');
      reports.verifyOption(reports.timeSelect, 'Last 3 Months');
    });
  });

  describe('Active Users', function () {
    xit('should verify active users graph is visible', function () {
      utils.expectIsDisplayed(reports.activeUserGraph);
      reports.verifyLegend('Users');
      reports.verifyLegend('Active Users');
      utils.expectIsNotPresent(reports.noData);
      utils.expectIsNotDisplayed(reports.activeUserRefresh);
    });

    xit('should Show Most Active Users', function () {
      utils.expectText(reports.mostActiveButton, 'Show Most Active Users');
      utils.click(reports.mostActiveButton);
      utils.expectIsDisplayed(reports.activeUsersTable);
      utils.expectCountToBeGreater(reports.activeUsersTableContent, 0);
      utils.expectAllDisplayed(reports.activeCarousel);
      utils.expectText(reports.mostActiveButton, 'Hide Most Active Users');
    });

    xit('should reload on time change', function () {
      utils.click(reports.timeSelect);
      utils.click(reports.getOptions(reports.timeSelect, 1));
      utils.expectIsNotDisplayed(reports.activeUsersTable);
      utils.expectIsDisplayed(reports.activeUserRefresh);
      utils.waitUntilEnabled(reports.timeSelect);
      utils.expectIsDisplayed(reports.activeUsersTable);
      utils.expectCountToBeGreater(reports.activeUsersTableContent, 0);
      utils.expectIsDisplayed(reports.activeUserGraph);
      utils.expectIsNotDisplayed(reports.activeUserRefresh);
      utils.expectAllDisplayed(reports.activeCarousel);
    });

    xit('should reload on customer change', function () {
      utils.click(reports.customerSelect);
      utils.click(reports.getOptions(reports.customerSelect, 5));
      utils.waitUntilEnabled(reports.timeSelect);
      utils.expectIsDisplayed(reports.activeUsersTable);
      utils.expectCount(reports.activeUsersTableContent, 0);
      utils.expectIsDisplayed(reports.activeUserGraph);
      utils.expectIsDisplayed(reports.activeUserRefresh);
      utils.expectIsPresent(reports.noData);
      utils.expectAllNotDisplayed(reports.activeCarousel);
    });

    xit('should Hide Most Active Users', function () {
      utils.expectText(reports.mostActiveButton, 'Hide Most Active Users');
      utils.click(reports.mostActiveButton);
      utils.expectIsNotDisplayed(reports.activeUsersTable);
      utils.expectText(reports.mostActiveButton, 'Show Most Active Users');
    });
  });

  // Log Out
  describe('Log Out', function () {
    xit('should log out', function () {
      navigation.logout();
    });
  });
});
