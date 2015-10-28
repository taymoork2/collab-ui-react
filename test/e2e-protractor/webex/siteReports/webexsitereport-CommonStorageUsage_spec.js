'use strict';

/* global describe, it, expect, login */

describe('WebEx site recording usage report', function () {

  it('navigate to reports', function () {
    login.loginThroughGui(sitereports.testAdmin.username, sitereports.testAdmin.password);
    navigation.clickReports();
    utils.wait(sitereports.webexReportsLink);
  });

  it('click on webex reports link', function () {
    utils.click(sitereports.webexReportsLink);
    utils.wait(sitereports.webexCommonStorageUsageLink);
  });

  it('click on common reports recording usage link', function () {
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
