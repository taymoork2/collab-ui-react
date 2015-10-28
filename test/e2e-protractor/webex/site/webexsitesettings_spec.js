'use strict';

/* global describe, it, expect, login */

describe('WebEx site settings', function () {

  it('navigate to WebEx site list', function () {
    login.loginThroughGui(sitesettings.testAdmin.username, sitesettings.testAdmin.password);
    navigation.clickServicesTab();
    utils.click(sitesettings.conferencing);
    navigation.expectCurrentUrl('/site-list');
  });

  it('click on configure site cog', function () {
    utils.click(sitesettings.configureSJSITE14);
    navigation.expectCurrentUrl(sitesettings.siteSettingsUrl);
  });

  it('show WebEx settings index', function () {
    utils.wait(sitesettings.webexSiteSettingsPanel);
  });

  it('show WebEx info card', function () {
    utils.wait(sitesettings.webexSiteInfoCardId);
  });

  it('show WebEx common settings card', function () {
    utils.wait(sitesettings.webexCommonSettingsCardId);
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
