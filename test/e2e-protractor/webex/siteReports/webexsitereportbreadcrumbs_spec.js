'use strict';

/* global describe, it, expect, login */

describe('WebEx site report breadcrumbs', function () {

  it('navigate to reports', function () {
    login.loginThroughGui(sitereports.testAdmin.username, sitereports.testAdmin.password);
    navigation.clickReports();
    utils.wait(sitereports.webexReportsLink);
  });

  it('click on webex reports link', function () {
    utils.click(sitereports.webexReportsLink);
    utils.wait(sitereports.webexCommonMeetingUsageLink);
  });

  it('click on common reports meeting usage link', function () {
    utils.click(sitereports.webexCommonMeetingUsageLink);
    utils.wait(sitereports.webexReportCrumb2);
  });

  it('Click on site reports index (2nd) bread crumb link', function () {
    utils.click(sitereports.webexReportCrumb2);
    utils.wait(sitereports.webexCommonMeetingUsageLink);
  });

  /*
  it('click on common reports meeting usage link (2nd time)', function () {
    utils.click(sitereports.webexCommonMeetingUsageLink);
    utils.wait(sitereports.webexReportCrumb1);
  });

  it('Click on site list (first) bread crumb link', function () {
    utils.click(sitereports.webexReportCrumb1);
    navigation.expectCurrentUrl('/site-list');
  });
  */

  //  it('should pause', function () {
  //    browser.pause();
  //  });

  it('should allow log out', function () {
    navigation.logout();
  });
});
