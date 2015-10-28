'use strict';

/* global describe, it, expect, login */

describe('WebEx site reports', function () {

  it('navigate to WebEx site list', function () {
    login.loginThroughGui(sitereports.testAdmin.username, sitereports.testAdmin.password);
    navigation.clickServicesTab();
    utils.click(sitereports.conferencing);
    navigation.expectCurrentUrl('/site-list');
  });

  it('click on site report cog', function () {
    utils.click(sitereports.reportSJSITE14);
    navigation.expectCurrentUrl(sitereports.siteReportsUrl);
  });

  it('show WebEx reports index', function () {
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
