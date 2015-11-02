'use strict';

/* global describe, it, expect, login */

describe('WebEx site reports cross-launch', function () {
  it('should login as t30citestprov9@mailinator.com and navigate to WebEx site list', function () {
    login.loginThroughGui(sitereports.testAdmin2.username, sitesettings.testAdmin2.password);
    navigation.clickServicesTab();
    utils.click(sitesettings.conferencing);
    navigation.expectCurrentUrl('/site-list');
  });

  it('should find webex reports cross-launch icon', function () {
    expect(sitesettings.xLaunchSiteReportsT30CITEST.isPresent).toBeTruthy();
  });

  it('should log out', function () {
    navigation.logout();
  });
});

describe('WebEx site reports iframe', function () {
  it('should login as sjsite14@mailinator.com and navigate to reports engagement', function () {
    login.loginThroughGui(sitereports.testAdmin.username, sitereports.testAdmin.password);
    navigation.clickReports();
    utils.wait(sitereports.reportEngagementId);
    expect(sitereports.webexReportsLink.isPresent()).toBeTruthy();
  });

  it('click on webex reports link and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportsLink);
    expect(sitereports.webexSiteReportsPanel.isPresent()).toBeTruthy();
  });

  it('click on common reports meetings in progress link and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonMeetingsInProgressLink);
    expect(sitereports.webexCommonMeetingsInProgressId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    expect(sitereports.webexSiteReportsPanel.isPresent()).toBeTruthy();
  });

  it('click on common reports meeting usage link and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonMeetingUsageLink);
    expect(sitereports.webexCommonMeetingUsageId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    expect(sitereports.webexSiteReportsPanel.isPresent()).toBeTruthy();
  });

  it('click on common reports recording usage link and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonRecordingUsageLink);
    expect(sitereports.webexCommonRecordingUsageId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    expect(sitereports.webexSiteReportsPanel.isPresent()).toBeTruthy();
  });

  it('click on common reports storage usage link and should navigate to the correct site report', function () {
    utils.click(sitereports.webexCommonStorageUsageLink);
    expect(sitereports.webexCommonStorageUsageId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb and should navigate to site reports index', function () {
    utils.click(sitereports.webexReportCrumb2);
    expect(sitereports.webexSiteReportsPanel.isPresent()).toBeTruthy();
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
