'use strict';

/* global describe, it, expect, login */

describe('WebEx site reports', function () {

  it('navigate to reports', function () {
    login.loginThroughGui(sitereports.testAdmin.username, sitereports.testAdmin.password);
    navigation.clickReports();
    utils.wait(sitereports.reportEngagementId);
    expect(sitereports.webexReportsLink.isPresent()).toBeTruthy();
  });

  it('click on webex reports link', function () {
    utils.click(sitereports.webexReportsLink);
    expect(sitereports.webexSiteReportsPanel.isPresent()).toBeTruthy();
  });

  it('click on common reports meetings in progress link', function () {
    utils.click(sitereports.webexCommonMeetingsInProgressLink);
    expect(sitereports.webexCommonMeetingsInProgressId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb', function () {
    utils.click(sitereports.webexReportCrumb2);
    expect(sitereports.webexSiteReportsPanel.isPresent()).toBeTruthy();
  });

  it('click on common reports meeting usage link', function () {
    utils.click(sitereports.webexCommonMeetingUsageLink);
    expect(sitereports.webexCommonMeetingUsageId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb', function () {
    utils.click(sitereports.webexReportCrumb2);
    expect(sitereports.webexSiteReportsPanel.isPresent()).toBeTruthy();
  });

  it('click on common reports recording usage link', function () {
    utils.click(sitereports.webexCommonRecordingUsageLink);
    expect(sitereports.webexCommonRecordingUsageId.isPresent()).toBeTruthy();
  });

  it('click on reports index breadcrumb', function () {
    utils.click(sitereports.webexReportCrumb2);
    expect(sitereports.webexSiteReportsPanel.isPresent()).toBeTruthy();
  });

  it('click on common reports storage usage link', function () {
    utils.click(sitereports.webexCommonStorageUsageLink);
    expect(sitereports.webexCommonStorageUsageId.isPresent()).toBeTruthy();
  });

  /**  
    it('should pause', function () {
      browser.pause()
    });
  **/

  it('log out', function () {
    navigation.logout();
  });
});
