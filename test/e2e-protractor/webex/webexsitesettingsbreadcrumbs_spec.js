'use strict';

/* global describe, it, expect, login */

describe('WebEx site settings breadcrumbs', function () {

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

  it('wait for WebEx settings page to appear with bread crumbs', function () {
    utils.wait(sitesettings.siteSettingsBreadCrumbs);
    expect(sitesettings.siteSettingsBreadCrumbs.isPresent()).toBeTruthy();
  });

  it('Click on site list (first) bread crumb', function () {
    utils.click(sitesettings.siteListCrumb);
    navigation.expectCurrentUrl('/site-list');
  });

  // it('should pause', function () {
  //   browser.pause();
  // });

  it('should allow log out', function () {
    navigation.logout();
  });
});
