'use strict';

/*global sitereports*/

sitereports.testInfo.describeCount = 0;
while (1 >= sitereports.testInfo.describeCount) {
  switch (sitereports.testInfo.describeCount) {
  case 1:
    sitereports.testInfo.testType = 'T30';
    sitereports.testInfo.describeText = 'WebEx site reports iframe test for ' + sitereports.testInfo.testType + ' site ' + sitereports.t30Info.siteUrl;
    break;

  default:
    sitereports.testInfo.testType = 'T31';
    sitereports.testInfo.describeText = 'WebEx site reports iframe test for ' + sitereports.testInfo.testType + ' site ' + sitereports.t31Info.siteUrl;
  }

  xdescribe(sitereports.testInfo.describeText, function () {

    if (sitereports.testInfo.testType == "T31") {
      beforeAll(function () {
        login.loginUsingIntegrationBackend('t31RegressionTestAdmin');
      });
    } else {
      beforeAll(function () {
        login.loginUsingIntegrationBackend('t30RegressionTestAdmin');
      });
    }

    it('should navigate to webex site list', function () {
      navigation.clickServicesTab();
      utils.click(sitereports.conferencing);
    });

    if (sitereports.testInfo.testType == "T31") {
      it('should click on reports icon for ' + sitereports.t31Info.siteUrl + ' and navigate to webex reports index', function () {
        utils.click(sitereports.T31ReportsCog);
        utils.wait(sitereports.webexSiteReportsPanel);
        utils.wait(sitereports.t31CardsSectionId);
      });
    } else {
      it('should click on reports icon for ' + sitereports.t30Info.siteUrl + ' and navigate to webex reports index', function () {
        utils.click(sitereports.T30ReportsCog);
        utils.wait(sitereports.webexSiteReportsPanel);
        utils.wait(sitereports.t30CardsSectionId);
      });
    }

    it('should navigate to reports engagement', function () {
      navigation.clickReports();
    });

    if (sitereports.testInfo.testType == "T31") {
      it('should navigate to webex reports index for site ' + sitereports.testInfo.siteUrl, function () {
        utils.click(sitereports.webexReportsLink);
        utils.wait(sitereports.webexSiteReportsPanel);
        utils.wait(sitereports.t31CardsSectionId);
      });
    } else {
      it('should navigate to webex reports index for site ' + sitereports.testInfo.siteUrl, function () {
        utils.click(sitereports.webexReportsLink);
        utils.wait(sitereports.webexSiteReportsPanel);
        utils.wait(sitereports.t30CardsSectionId);
      });
    }

    it('should not see last sync text or link', function () {
      expect(sitereports.lastSyncElement.isPresent()).toBeFalsy();
    });

    it('click on common reports meetings in progress link', function () {
      utils.click(sitereports.webexCommonMeetingsInProgressLink);
      utils.wait(sitereports.webexCommonMeetingsInProgressId);
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      utils.click(sitereports.webexReportCrumb2);
      utils.wait(sitereports.webexSiteReportsPanel);
    });

    it('click on common reports meeting usage link', function () {
      utils.click(sitereports.webexCommonMeetingUsageLink);
      utils.wait(sitereports.webexCommonMeetingUsageId);
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      utils.click(sitereports.webexReportCrumb2);
      utils.wait(sitereports.webexSiteReportsPanel);
    });

    it('click on common reports recording usage link', function () {
      utils.click(sitereports.webexCommonRecordingUsageLink);
      utils.wait(sitereports.webexCommonRecordingUsageId);
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      utils.click(sitereports.webexReportCrumb2);
      utils.wait(sitereports.webexSiteReportsPanel);
    });

    it('click on common reports storage usage link', function () {
      utils.click(sitereports.webexCommonStorageUsageLink);
      utils.wait(sitereports.webexCommonStorageUsageId);
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      utils.click(sitereports.webexReportCrumb2);
      utils.wait(sitereports.webexSiteReportsPanel);
    });

    // it('should pause', function () {
    //   browser.pause()
    // });

    afterAll(function () {
      navigation.logout();
    });
  });

  ++sitereports.testInfo.describeCount;
}
