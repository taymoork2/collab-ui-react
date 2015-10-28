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

  it('show common reports card', function () {
    utils.wait(sitereports.webexCommonReportsCardId);
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
