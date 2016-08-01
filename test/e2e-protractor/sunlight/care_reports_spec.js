'use strict';

describe('Care Reports', function () {

  it('should login', function () {
    login.login('contactcenter-admin');
  });

  describe('Reports Page', function () {
    var time = ['Today', 'Yesterday', 'Last Week', 'Last Month', 'Last Three Months'];
    var lowerTime = ['today', 'yesterday', 'last week', 'last month', 'last 3 months'];

    it('should navigate to customer reports page and click Care tab', function () {
      navigation.clickReports();
      utils.expectIsPresent(reports.pageTitle);
      navigation.clickCareReports();
      utils.expectIsPresent(reports.pageTitle);
    });

    it('should verify report type buttons', function () {
      utils.expectText(reports.allTypes, 'All');
      utils.expectText(reports.engagement, 'Engagement');
      utils.expectText(reports.quality, 'Quality');
    });

    it('should verify time dropdown', function () {
      reports.enabledFilters(reports.timeSelectCare);
      reports.clickFilter(reports.timeSelectCare);
      for (var i = 0; i < time.length; i++) {
        reports.verifyOption(reports.timeSelectCare, time[i]);
      }
      reports.clickFilter(reports.timeSelectCare);
    });

    it('should show all reports', function () {
      // Task Incoming
      utils.expectIsDisplayed(reports.taskIncomingHeader);
      utils.expectIsDisplayed(reports.taskIncomingDescription);
      utils.expectTextToBeSet(reports.taskIncomingDescription, lowerTime[1]);
      utils.expectIsDisplayed(reports.taskIncomingGraph);

    });

    it('should be able to change time period', function () {
      reports.clickFilter(reports.timeSelectCare);
      utils.click(reports.getOption(reports.timeSelectCare, time[1]));
    });

  });
});
