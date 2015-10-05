'use strict';

/* global describe, it, expect, login */

describe('WebEx site settings', function () {

  it('should allow login as admin user', function () {
    login.loginThroughGui(sitesettings.testAdmin.username, sitesettings.testAdmin.password);
  });

  it('click on services tab', function () {
    navigation.clickServicesTab();
  });

  it('click on conferencing tab', function () {
    utils.click(sitesettings.conferencing);
    navigation.expectCurrentUrl('/site-list');
  });

  it('click on first reports link', function () {
    utils.click(sitesettings.siteReports);
    navigation.expectCurrentUrl('/webexreports');
  });

  it('wait for WebEx reports page to appear with bread crumbs', function () {
    sitesettings.waitForWebexReportBreadCrumbs();
    expect(sitesettings.webexReportBreadCrumbs.isPresent()).toBeTruthy();
  });

  it('click site admin reports link', function () {
    utils.click(sitesettings.siteAdminReportsLink);
    navigation.expectCurrentUrl('/iwebexreports');
  });

  it('wait for WebEx reports iframe page to appear with bread crumbs', function () {
    sitesettings.waitForWebexReportIFrameBreadCrumbs();
    expect(sitesettings.webexReportIFrameBreadCrumbs.isPresent()).toBeTruthy();
  });

  it('Click on site report (second) bread crumb link', function () {
    utils.click(sitesettings.webexReportIFrameCrumb2);
    navigation.expectCurrentUrl('/webexreports');
  });

  it('wait for WebEx reports page to appear with bread crumbs', function () {
    sitesettings.waitForWebexReportBreadCrumbs();
    expect(sitesettings.webexReportBreadCrumbs.isPresent()).toBeTruthy();
  });

  it('Click on site list (first) bread crumb link', function () {
    utils.click(sitesettings.webexReportCrumb);
    navigation.expectCurrentUrl('/site-list');
  });

  // it('should pause', function () {
  //   browser.pause();
  // });

  it('should allow log out', function () {
    navigation.logout();
  });
});
