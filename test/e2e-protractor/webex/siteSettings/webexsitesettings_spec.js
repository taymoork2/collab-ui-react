'use strict';

sitereports.testInfo.describeCount = 0;
while (1 >= sitereports.testInfo.describeCount) {
  switch (sitereports.testInfo.describeCount) {
  case 1:
    sitereports.testInfo.siteType = 'T30';
    sitereports.testInfo.siteUrl = "cisjsite002.cisco.com";
    sitereports.testInfo.describeText = 'WebEx site reports iframe test for T30 site ' + sitereports.testInfo.siteUrl;
    break;

  default:
    sitereports.testInfo.siteType = 'T31';
    sitereports.testInfo.siteUrl = "sjsite14.cisco.com";
    sitereports.testInfo.describeText = 'WebEx site reports iframe test for T31 site ' + sitereports.testInfo.siteUrl;
  }

  describe(sitereports.testInfo.describeText, function () {
    afterEach(function () {
      utils.dumpConsoleErrors();
    });

    if (sitereports.testInfo.siteType == "T31") {
      it('should signin as ' + sitereports.testAdmin1.username + ' for T31 site config test', function () {
        login.loginThroughGui(sitereports.testAdmin1.username, sitereports.testAdmin1.password);
      });
    } else {
      it('should signin as ' + sitereports.testAdmin2.username + ' for T30 site config test', function () {
        login.loginThroughGui(sitereports.testAdmin2.username, sitereports.testAdmin2.password);
      });
    }

    it('should navigate to webex site list', function () {
      navigation.clickServicesTab();
      utils.click(sitereports.conferencing);
    });

    if (sitereports.testInfo.siteType == "T31") {
      it('should click on reports cog for ' + sitereports.testInfo.siteUrl + ' and navigate to webex reports index', function () {
        utils.click(sitereports.configureSJSITE14Cog);
        utils.wait(sitereports.webexSiteReportsPanel);
        utils.wait(sitereports.sjsite14CardsSectionId);
      });
    } else {
      it('should click on reports cog for ' + sitereports.testInfo.siteUrl + ' and navigate to webex reports index', function () {
        utils.click(sitereports.configureCISJSITE002Cog);
        utils.wait(sitereports.webexSiteReportsPanel);
        utils.wait(sitereports.cisjsite002CardsSectionId);
      });
    }

    it('should navigate to reports engagement', function () {
      navigation.clickReports();
    });

    if (sitereports.testInfo.siteType == "T31") {
      it('should navigate to webex reports index for site ' + sitereports.testInfo.siteUrl, function () {
        utils.click(sitereports.webexReportsLink);
        utils.wait(sitereports.webexSiteReportsPanel);
        utils.wait(sitereports.sjsite14CardsSectionId);
      });
    } else {
      it('should navigate to webex reports index for site ' + sitereports.testInfo.siteUrl, function () {
        utils.click(sitereports.webexReportsLink);
        utils.wait(sitereports.webexSiteReportsPanel);
        utils.wait(sitereports.cisjsite002CardsSectionId);
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

    it('click on common reports meetings in progress link in wide card', function () {
      utils.click(sitereports.webexCommonInfoCardMeetingInProgress);
      utils.wait(sitereports.webexCommonMeetingsInProgressId);
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      utils.click(sitereports.webexReportCrumb2);
      utils.wait(sitereports.webexSiteReportsPanel);
    });

    it('click on common reports meetings usage link in wide card', function () {
      utils.click(sitereports.webexCommonInfoCardMeetingUsage);
      utils.wait(sitereports.webexCommonMeetingUsageId);
    });

    it('click on reports index breadcrumb and should navigate to site reports index', function () {
      utils.click(sitereports.webexReportCrumb2);
      utils.wait(sitereports.webexSiteReportsPanel);
    });

    // it('should pause', function () {
    //   browser.pause()
    // });

    it('should log out', function () {
      navigation.logout();
    });
  });

  ++sitereports.testInfo.describeCount;
}
