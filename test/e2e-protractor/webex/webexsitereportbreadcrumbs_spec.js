'use strict';

/* global describe, it, expect, login */

describe('WebEx report breadcrumbs', function () {

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
    utils.wait(sitesettings.webexReportBreadCrumbs);
    expect(sitesettings.webexReportBreadCrumbs.isPresent()).toBeTruthy();
  });

  it('click site admin reports link', function () {
    utils.click(sitesettings.meetingUsageReportLink);
    navigation.expectCurrentUrl(sitesettings.siteAdminReportsUrl);
  });

  it('wait for WebEx reports iframe page to appear with bread crumbs', function () {
    utils.wait(sitesettings.webexReportIFrameBreadCrumbs);
    expect(sitesettings.webexReportIFrameBreadCrumbs.isPresent()).toBeTruthy();
  });

  it('Click on site report (second) bread crumb link', function () {
    utils.click(sitesettings.webexReportIFrameCrumb2);
    navigation.expectCurrentUrl(sitesettings.siteAdminReportsUrl);
  });

  it('wait for WebEx reports page to appear with bread crumbs', function () {
    utils.wait(sitesettings.webexReportBreadCrumbs);
    expect(sitesettings.webexReportBreadCrumbs.isPresent()).toBeTruthy();
  });

  it('Click on site list (first) bread crumb link', function () {
    utils.click(sitesettings.webexReportCrumb);
    navigation.expectCurrentUrl('/site-list');
  });

  //  it('should pause', function () {
  //    browser.pause();
  //  });

  it('should allow log out', function () {
    navigation.logout();
  });
});
