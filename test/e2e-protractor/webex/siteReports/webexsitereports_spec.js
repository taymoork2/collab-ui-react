'use strict';

/* global webExSiteReports */
/* global webEx */
/* global webExCommon */

webExCommon.testInfo.describeCount = 0;

while (1 >= webExCommon.testInfo.describeCount) {
  switch (webExCommon.testInfo.describeCount) {
  case 1:
    webExCommon.testInfo.testType = 'T30';
    webExCommon.testInfo.describeText = 'WebEx site reports iframe test for BTS ' + webExCommon.testInfo.testType + ' site ' + webExCommon.BTS1.siteUrl;
    break;

  default:
    webExCommon.testInfo.testType = 'T31';
    webExCommon.testInfo.describeText = 'WebEx site reports iframe test for BTS ' + webExCommon.testInfo.testType + ' site ' + webExCommon.BTS3.siteUrl;
  }

  describe(webExCommon.testInfo.describeText, function () {
    var setup = false;

    if (webExCommon.testInfo.testType == "T31") {
      beforeAll(function () {
        var promise = webEx.setup(
          1,
          'wbx-t31RegressionTestAdmin',
          webExCommon.BTS3.testAdminUsername,
          webExCommon.BTS3.testAdminPassword,
          webExCommon.BTS3.siteUrl
        );

        promise.then(
          function success(ticket) {
            setup = (null !== ticket);
          },

          function error() {
            setup = false;
          }
        );
      });
    } else {
      beforeAll(function () {
        var promise = webEx.setup(
          1,
          'wbx-t30RegressionTestAdmin',
          webExCommon.BTS1.testAdminUsername,
          webExCommon.BTS1.testAdminPassword,
          webExCommon.BTS1.siteUrl
        );

        promise.then(
          function success(ticket) {
            setup = (null !== ticket);
          },

          function error() {
            setup = false;
          }
        );
      });
    }

    if (webExCommon.testInfo.testType == "T31") {
      it('should sign in as ' + webExCommon.BTS3.testAdminUsername + ' and navigate to webex site list', function () {
        if (setup) {
          navigation.clickServicesTab();
          utils.click(webExSiteReports.conferencing);
        }
      });

      it('should click on reports icon for ' + webExCommon.BTS3.siteUrl + ' and navigate to webex reports index', function () {
        if (setup) {
          utils.click(webExCommon.t31ReportsCog);
          utils.wait(webExSiteReports.webexSiteReportsPanel);
          utils.wait(webExCommon.t31CardsSectionId);
        }
      });
    } else {
      it('should sign in as ' + webExCommon.BTS1.testAdminUsername + ' and navigate to webex site list', function () {
        if (setup) {
          navigation.clickServicesTab();
          utils.click(webExSiteReports.conferencing);
        }
      });

      it('should click on reports icon for ' + webExCommon.BTS1.siteUrl + ' and navigate to webex reports index', function () {
        if (setup) {
          utils.click(webExCommon.t30ReportsCog);
          utils.wait(webExSiteReports.webexSiteReportsPanel);
          utils.wait(webExCommon.t30CardsSectionId);
        }
      });
    }

    it('should navigate to reports engagement', function () {
      if (setup) {
        navigation.clickReports();
      }
    });

    if (webExCommon.testInfo.testType == "T31") {
      it('should navigate to webex reports index for site ' + webExCommon.testInfo.siteUrl, function () {
        if (setup) {
          utils.click(webExSiteReports.webexReportsLink);
          utils.wait(webExSiteReports.webexSiteReportsPanel);
          utils.wait(webExCommon.t31CardsSectionId);
        }
      });
    } else {
      it('should navigate to webex reports index for site ' + webExCommon.testInfo.siteUrl, function () {
        if (setup) {
          utils.click(webExSiteReports.webexReportsLink);
          utils.wait(webExSiteReports.webexSiteReportsPanel);
          utils.wait(webExCommon.t30CardsSectionId);
        }
      });
    }

    it('should not see last sync text or link', function () {
      if (setup) {
        expect(webExSiteReports.lastSyncElement.isPresent()).toBeFalsy();
      }
    });

    it('click on common reports meetings in progress link', function () {
      if (setup) {
        utils.click(webExSiteReports.webexCommonMeetingsInProgressLink);
        utils.wait(webExSiteReports.webexCommonMeetingsInProgressId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(webExSiteReports.webexReportCrumb2);
        utils.wait(webExSiteReports.webexSiteReportsPanel);
      }
    });

    it('click on common reports inactive users link', function () {
      if (setup) {
        utils.click(webExSiteReports.webexCommonInactiveUserLink);
        utils.wait(webExSiteReports.webexCommonInactiveUserId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(webExSiteReports.webexReportCrumb2);
        utils.wait(webExSiteReports.webexSiteReportsPanel);
      }
    });

    it('click on common reports meeting usage link', function () {
      if (setup) {
        utils.click(webExSiteReports.webexCommonMeetingUsageLink);
        utils.wait(webExSiteReports.webexCommonMeetingUsageId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(webExSiteReports.webexReportCrumb2);
        utils.wait(webExSiteReports.webexSiteReportsPanel);
      }
    });

    it('click on common reports recording usage link', function () {
      if (setup) {
        utils.click(webExSiteReports.webexCommonRecordingUsageLink);
        utils.wait(webExSiteReports.webexCommonRecordingUsageId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(webExSiteReports.webexReportCrumb2);
        utils.wait(webExSiteReports.webexSiteReportsPanel);
      }
    });

    it('click on common reports storage usage link', function () {
      if (setup) {
        utils.click(webExSiteReports.webexCommonStorageUsageLink);
        utils.wait(webExSiteReports.webexCommonStorageUsageId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(webExSiteReports.webexCommonStorageUsageLink);
        utils.wait(webExSiteReports.webexCommonStorageUsageId);
      }
    });

    // it('should pause', function () {
    //   browser.pause()
    // });

    it('should allow log out', function () {
      navigation.logout();
    });
  });

  ++webExCommon.testInfo.describeCount;
}
