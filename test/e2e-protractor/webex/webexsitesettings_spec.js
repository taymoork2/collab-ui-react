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

  it('click on configure site', function () {
    utils.click(sitesettings.configureSite);
    navigation.expectCurrentUrl('/webexSiteSettings');
  });

  it('wait for WebEx settings page to appear', function () {
    sitesettings.waitForWebexSiteSettingsPanel();
    expect(sitesettings.webexSiteSettingsPanel.isPresent()).toBeTruthy();
  });

  xit('should pause', function () {
    browser.pause()
  });

  it('should allow log out', function () {
    navigation.logout();
  });
});
