'use strict';

/* global describe, it, expect, login */

describe('WebEx site settings', function () {

  it('should allow login as admin user', function () {
    login.loginThroughGui(sitesettings.testAdmin.username, sitesettings.testAdmin.password);
  });

  it('click on services tab', function () {
    navigation.clickServicesTab();
  });

  it('click on conferencing option', function () {
    utils.click(sitesettings.conferencing);
    navigation.expectCurrentUrl('/site-list');
  });

  it('click on configure site cog', function () {
    utils.click(sitesettings.configureSJSITE14);
    navigation.expectCurrentUrl('/webexSiteSettings');
  });

  it('wait for WebEx settings settings page to appear', function () {
    sitesettings.waitForWebexSiteSettingsPanel();
    expect(sitesettings.webexSiteSettingsPanel.isPresent()).toBeTruthy();
  });

  it('click on email all hosts button', function () {
    utils.click(sitesettings.emailAllHostsBtn);
    navigation.expectCurrentUrl('/webexSiteSetting');
  });

  it('wait for WebEx email all hosts page to appear', function () {
    sitesettings.waitForWebexSiteSettingPanel();
    expect(sitesettings.webexEmailAllHostsId.isPresent()).toBeTruthy();
  });

  it('Click on site settings bread crumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    navigation.expectCurrentUrl('/webexSiteSettings');
  });

  it('wait for WebEx settings index page to appear (2rd time)', function () {
    sitesettings.waitForWebexSiteSettingsPanel();
    expect(sitesettings.webexSiteSettingsPanel.isPresent()).toBeTruthy();
  });

  // TODO: additional tests to click on various setting page links on the site settings page

  // it('should pause', function () {
  //   browser.pause()
  // });

  it('should allow log out', function () {
    navigation.logout();
  });
});
