'use strict';

/* global sitereports */
/* global webEx */

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

  describe(sitereports.testInfo.describeText, function () {
    var setup = false;

    if (sitereports.testInfo.testType == "T31") {
      /*
      beforeAll(function () {
        login.loginUsingIntegrationBackend('t31RegressionTestAdmin');
      });
      */
      beforeAll(function () {
        var promise = webEx.setup(
          1,
          't31RegressionTestAdmin',
          sitereports.t31Info.testAdminUsername,
          sitereports.t31Info.testAdminPassword,
          sitereports.t31Info.siteUrl
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
      /*
      beforeAll(function () {
        login.loginUsingIntegrationBackend('t30RegressionTestAdmin');
      });
      */
      beforeAll(function () {
        var promise = webEx.setup(
          1,
          't30RegressionTestAdmin',
          sitereports.t30Info.testAdminUsername,
          sitereports.t30Info.testAdminPassword,
          sitereports.t30Info.siteUrl
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

    if (sitereports.testInfo.testType == "T31") {
      it('should sign in as ' + sitereports.t31Info.testAdminUsername + ' and navigate to webex site list', function () {
        if (setup) {
          navigation.clickServicesTab();
          utils.click(sitereports.conferencing);
        }
      });

      it('should click on reports icon for ' + sitereports.t31Info.siteUrl + ' and navigate to webex reports index', function () {
        if (setup) {
          utils.click(sitereports.T31ReportsCog);
          utils.wait(sitereports.webexSiteReportsPanel);
          utils.wait(sitereports.t31CardsSectionId);
        }
      });
    } else {
      it('should sign in as ' + sitereports.t30Info.testAdminUsername + ' and navigate to webex site list', function () {
        if (setup) {
          navigation.clickServicesTab();
          utils.click(sitereports.conferencing);
        }
      });

      it('should click on reports icon for ' + sitereports.t30Info.siteUrl + ' and navigate to webex reports index', function () {
        if (setup) {
          utils.click(sitereports.T30ReportsCog);
          utils.wait(sitereports.webexSiteReportsPanel);
          utils.wait(sitereports.t30CardsSectionId);
        }
      });
    }

    it('should navigate to reports engagement', function () {
      if (setup) {
        navigation.clickReports();
      }
    });

    if (sitereports.testInfo.testType == "T31") {
      it('should navigate to webex reports index for site ' + sitereports.testInfo.siteUrl, function () {
        if (setup) {
          utils.click(sitereports.webexReportsLink);
          utils.wait(sitereports.webexSiteReportsPanel);
          utils.wait(sitereports.t31CardsSectionId);
        }
      });
    } else {
      it('should navigate to webex reports index for site ' + sitereports.testInfo.siteUrl, function () {
        if (setup) {
          utils.click(sitereports.webexReportsLink);
          utils.wait(sitereports.webexSiteReportsPanel);
          utils.wait(sitereports.t30CardsSectionId);
        }
      });
    }

    it('should not see last sync text or link', function () {
      if (setup) {
        expect(sitereports.lastSyncElement.isPresent()).toBeFalsy();
      }
    });

    it('click on common reports meetings in progress link', function () {
      if (setup) {
        utils.click(sitereports.webexCommonMeetingsInProgressLink);
        utils.wait(sitereports.webexCommonMeetingsInProgressId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(sitereports.webexReportCrumb2);
        utils.wait(sitereports.webexSiteReportsPanel);
      }
    });

    it('click on common reports inactive users link', function () {
      if (setup) {
        utils.click(sitereports.webexCommonInactiveUserLink);
        utils.wait(sitereports.webexCommonInactiveUserId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(sitereports.webexReportCrumb2);
        utils.wait(sitereports.webexSiteReportsPanel);
      }
    });

    it('click on common reports meeting usage link', function () {
      if (setup) {
        utils.click(sitereports.webexCommonMeetingUsageLink);
        utils.wait(sitereports.webexCommonMeetingUsageId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(sitereports.webexReportCrumb2);
        utils.wait(sitereports.webexSiteReportsPanel);
      }
    });

    it('click on common reports recording usage link', function () {
      if (setup) {
        utils.click(sitereports.webexCommonRecordingUsageLink);
        utils.wait(sitereports.webexCommonRecordingUsageId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(sitereports.webexReportCrumb2);
        utils.wait(sitereports.webexSiteReportsPanel);
      }
    });

    it('click on common reports storage usage link', function () {
      if (setup) {
        utils.click(sitereports.webexCommonStorageUsageLink);
        utils.wait(sitereports.webexCommonStorageUsageId);
      }
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      if (setup) {
        utils.click(sitereports.webexCommonStorageUsageLink);
        utils.wait(sitereports.webexCommonStorageUsageId);
      }
    });

    // it('should pause', function () {
    //   browser.pause()
    // });

    it('should allow log out', function () {
      navigation.logout();
    });
  });

  ++sitereports.testInfo.describeCount;
}
