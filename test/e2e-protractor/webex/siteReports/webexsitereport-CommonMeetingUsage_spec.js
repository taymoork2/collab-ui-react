'use strict';

/* global describe, it, expect, login */

describe('WebEx site meeting usage report', function () {

  it('navigate to reports', function () {
    login.loginThroughGui(sitereports.testAdmin.username, sitereports.testAdmin.password);
    navigation.clickReports();
    utils.wait(sitereports.webexReportsLink);
  });

  it('click on webex reports link', function () {
    utils.click(sitereports.webexReportsLink);
    utils.wait(sitereports.webexCommonMeetingUsageReportLink);
  });

  it('click on common reports meeting usage link', function () {
    utils.click(sitereports.webexCommonMeetingUsageReportLink);
    utils.wait(sitereports.webexCommonMeetingUsageReportId);
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
