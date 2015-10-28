'use strict';

/* global describe, it, expect, login */

describe('WebEx site reports', function () {

  it('navigate to reports', function () {
    login.loginThroughGui(sitereports.testAdmin.username, sitereports.testAdmin.password);
    navigation.clickReports();
    utils.wait(sitereports.webexReportsLink);
  });

  it('click on webex reports link', function () {
    utils.click(sitereports.webexReportsLink);
    utils.wait(sitereports.webexSiteReportsPanel);
  });
  
  it('click on common reports meetings in progress link', function () {
    utils.wait(sitereports.webexCommonMeetingsInProgressLink);
    utils.click(sitereports.webexCommonMeetingsInProgressLink);
    utils.wait(sitereports.webexCommonMeetingsInProgressId);
  });
  
  it('Click on site reports index bread crumb link', function () {
	utils.wait(sitereports.webexReportCrumb2);
    utils.click(sitereports.webexReportCrumb2);
    utils.wait(sitereports.webexSiteReportsPanel);
  });

  it('click on common reports meeting usage link', function () {
	    utils.wait(sitereports.webexCommonMeetingUsageLink);
	    utils.click(sitereports.webexCommonMeetingUsageLink);
	    utils.wait(sitereports.webexCommonMeetingUsageId);
  });
  
  it('Click on site reports index bread crumb link', function () {
		utils.wait(sitereports.webexReportCrumb2);
	    utils.click(sitereports.webexReportCrumb2);
	    utils.wait(sitereports.webexSiteReportsPanel);
  });

  it('click on common reports recording usage link', function () {
	    utils.wait(sitereports.webexCommonRecordingUsageLink);
	    utils.click(sitereports.webexCommonRecordingUsageLink);
	    utils.wait(sitereports.webexCommonRecordingUsageId);
  });

  it('Click on site reports index bread crumb link', function () {
		utils.wait(sitereports.webexReportCrumb2);
	    utils.click(sitereports.webexReportCrumb2);
	    utils.wait(sitereports.webexSiteReportsPanel);
  });

  it('click on common reports storage usage link', function () {
	    utils.wait(sitereports.webexCommonStorageUsageLink);
	    utils.click(sitereports.webexCommonStorageUsageLink);
	    utils.wait(sitereports.webexCommonStorageUsageId);
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
