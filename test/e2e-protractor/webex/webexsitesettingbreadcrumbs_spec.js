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
    navigation.expectCurrentUrl(sitesettings.siteSettingsUrl);
  });

  it('wait for WebEx settings index page to appear', function () {
    utils.wait(sitesettings.webexSiteSettingsPanel);
    expect(sitesettings.webexSiteSettingsPanel.isPresent()).toBeTruthy();
  });

  it('click on common settings site options link', function () {
    utils.click(sitesettings.configureCommonSiteOptionsLink);
    navigation.expectCurrentUrl(sitesettings.siteSettingsUrl);
  });

  it('wait for WebEx setting page to appear with bread crumbs', function () {
    utils.wait(sitesettings.siteSettingBreadCrumbs);
    expect(sitesettings.siteSettingBreadCrumbs.isPresent()).toBeTruthy();
  });

  it('Click on site settings bread crumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    navigation.expectCurrentUrl(sitesettings.siteSettingsUrl);
  });

  it('wait for WebEx settings index page to appear (2rd time)', function () {
    utils.wait(sitesettings.webexSiteSettingsPanel);
    expect(sitesettings.webexSiteSettingsPanel.isPresent()).toBeTruthy();
  });

  it('click on common settings site options link', function () {
    utils.click(sitesettings.configureCommonSiteOptionsLink);
    navigation.expectCurrentUrl(sitesettings.siteSettingsUrl);
  });

  it('wait for WebEx setting page to appear with bread crumbs (2nd time)', function () {
    utils.wait(sitesettings.siteSettingBreadCrumbs);
    expect(sitesettings.siteSettingBreadCrumbs.isPresent()).toBeTruthy();
  });

  it('Click on site list bread crumb', function () {
    utils.click(sitesettings.siteListCrumb);
    navigation.expectCurrentUrl('/site-list');
  });

  // it('should pause', function () {
  //   browser.pause()
  // });

  it('should allow log out', function () {
    navigation.logout();
  });
});
