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
    expect(sitesettings.webexSiteInfoCardId.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent()).toBeTruthy();
  });

  /**  
    it('should pause', function () {
      browser.pause()
    });
  **/

  it('should allow log out', function () {
    navigation.logout();
  });
});
