'use strict';

// Waiting for new page to go active before turning on tests
xdescribe('Partner Reports', function () {
  describe('Log In', function () {
    it('should login', function () {
      login.partnerlogin(partner.testuser.username, partner.testuser.password);
    });
  });

  describe('Reports Page', function () {
    it('should navigate to partner reports page', function () {
      navigation.clickReports();
      expect(reports.pageTitle.isPresent()).toBeTruthy();
    });

    it('should verify report tabs', function () {
      reports.verifyReportTab('Engagement');
      reports.verifyReportTab('Quality');
      reports.verifyReportTab('Opportunities');
    });

    it('should verify time dropdown', function () {
      utils.click(reports.timeSelect);
      reports.verifyOption(reports.timeSelect, 'All Time');
      reports.verifyOption(reports.timeSelect, 'Previous Week');
      reports.verifyOption(reports.timeSelect, 'Previous Month');
      reports.verifyOption(reports.timeSelect, 'Last Three Months');
    });

    it('should verify service dropdown', function () {
      utils.click(reports.serviceSelect);
      reports.verifyOption(reports.serviceSelect, 'All Services');
    });

    it('should verify service dropdown', function () {
      utils.click(reports.customerSelect);
      reports.verifyOption(reports.customerSelect, 'All Customers');
      browser.wait(function () {
        return reports.engagementRefreshDiv.isDisplayed().then(function (value) {
          return !value;
        });
      });
      reports.numOptions(reports.customerSelect).then(function (totalOptions) {
        expect(totalOptions > 0).toBeTruthy();
        if (totalOptions > 10) {
          reports.verifyOption(reports.customerSelect, '5 Most Engaged');
          reports.verifyOption(reports.customerSelect, '5 Least Engaged');
          reports.verifyOption(reports.customerSelect, '5 Highest Quality');
          reports.verifyOption(reports.customerSelect, '5 Lowest Quality');
        }
      });
    });
  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });
});
