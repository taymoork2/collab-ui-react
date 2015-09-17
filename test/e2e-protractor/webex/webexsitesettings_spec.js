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

  it('click on configure site cog', function () {
    utils.click(sitesettings.configureSite);
    navigation.expectCurrentUrl('/webexSiteSettings');
  });

  it('wait for WebEx settings index page to appear', function () {
    sitesettings.waitForWebexSiteSettingsPanel();
    expect(sitesettings.webexSiteSettingsPanel.isPresent()).toBeTruthy();
  });

  // TODO: click on the email all hosts button

  // TODO: wait for the email all hosts iframe page to appear

  // TODO: click on the sites list page breadcrumb

  // TODO: wait for the site list page to appear

  // TODO: click on the configure site cog

  // TODO: wait for the settings index page to appear

  // TODO: click on the the settings index page breadcrumb

  // TODO: wait for the settings index page to appear

  // TODO: click on the email all hosts button

  // TODO: wait for the email all hosts iframe page to appear

  xit('should pause', function () {
    browser.pause()
  });

  it('should allow log out', function () {
    navigation.logout();
  });
});
