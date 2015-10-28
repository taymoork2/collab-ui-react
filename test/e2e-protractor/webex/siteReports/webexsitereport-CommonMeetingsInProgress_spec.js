'use strict';

/* global describe, it, expect, login */

describe('WebEx site meetings in progress report', function () {

  it('navigate to reports', function () {
    login.loginThroughGui(sitereports.testAdmin.username, sitereports.testAdmin.password);
    navigation.clickReports();
    utils.wait(sitereports.webexReportsLink);
  });

  it('click on webex reports link', function () {
    utils.click(sitereports.webexReportsLink);
    utils.wait(sitereports.webexCommonMeetingsInProgressLink);
  });

  it('click on common reports meetings in progress link', function () {
    utils.click(sitereports.webexCommonMeetingsInProgressLink);
    utils.wait(sitereports.webexCommonMeetingsInProgressId);
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
