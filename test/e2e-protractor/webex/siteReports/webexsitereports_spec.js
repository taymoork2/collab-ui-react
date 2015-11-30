'use strict';

/* global describe, it, expect, login */

describe('WebEx site reports cross-launch', function () {
  it('should login as t30citestprov9@mailinator.com', function () {
    login.loginThroughGui(sitereports.testAdmin2.username, sitesettings.testAdmin2.password);
  });

  it('should navigate to WebEx site list and find webex reports cross-launch icon', function () {
    navigation.clickServicesTab();
    utils.click(sitesettings.conferencing);
    navigation.expectCurrentUrl('/site-list');
    expect(sitesettings.xLaunchSiteReportsT30CITEST.isPresent).toBeTruthy();
  });

  it('should log out', function () {
    navigation.logout();
  });
});

describe('WebEx site reports iframe', function () {
  it('should login as sjsite14@mailinator.com and navigate to reports engagement', function () {
    login.loginThroughGui(sitereports.testAdmin.username, sitereports.testAdmin.password);
  });

  it('should navigate to reports engagement', function () {
    navigation.clickReports();
    utils.wait(sitereports.webexReportsLink);
  });

  it('should navigate to webex reports index', function () {
    utils.click(sitereports.webexReportsLink);
    utils.wait(sitereports.webexSiteReportsPanel);
  });

  it('should not see last sync text or link', function () {
    expect(sitereports.lastSyncElement.isPresent()).toBeFalsy();
  });

  it('click on common reports meetings in progress link and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonMeetingsInProgressLink);
    utils.wait(sitereports.webexReportCrumb2);
    expect(sitereports.webexCommonMeetingsInProgressId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    utils.wait(sitereports.webexSiteReportsPanel);
  });

  it('click on common reports meeting usage link and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonMeetingUsageLink);
    utils.wait(sitereports.webexReportCrumb2);
    expect(sitereports.webexCommonMeetingUsageId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    utils.wait(sitereports.webexSiteReportsPanel);
  });

  it('click on common reports recording usage link and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonRecordingUsageLink);
    utils.wait(sitereports.webexReportCrumb2);
    expect(sitereports.webexCommonRecordingUsageId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    utils.wait(sitereports.webexSiteReportsPanel);
  });

  it('click on common reports storage usage link and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonStorageUsageLink);
    utils.wait(sitereports.webexReportCrumb2);
    expect(sitereports.webexCommonStorageUsageId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    utils.wait(sitereports.webexSiteReportsPanel);
  });

  it('click on common reports meetings in progress link in wide card and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonInfoCardMeetingInProgress);
    utils.wait(sitereports.webexReportCrumb2);
    expect(sitereports.webexCommonMeetingsInProgressId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    utils.wait(sitereports.webexSiteReportsPanel);
  });

  it('click on common reports meetings usage link in wide card and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonInfoCardMeetingUsage);
    utils.wait(sitereports.webexReportCrumb2);
    expect(sitereports.webexCommonMeetingUsageId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    utils.wait(sitereports.webexSiteReportsPanel);
  });

  /**
    it('should pause', function () {
      browser.pause()
    });
  **/

  it('should log out', function () {
    navigation.logout();
  });
});
