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
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
  });

  it('wait for common settings site options page to appear', function () {
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.webexCommonSiteOptionsId.isPresent()).toBeTruthy();
  });

  // TODO: additional tests to click on various setting page links on the site settings page

  /**  
    it('should pause', function () {
      browser.pause()
    });
  **/

  it('should allow log out', function () {
    navigation.logout();
  });
});
