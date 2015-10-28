'use strict';

/* global describe, it, expect, login */

describe('WebEx Common Settings -> CMR', function () {

  it('should navigate to WebEx site list', function () {
    login.loginThroughGui(sitesettings.testAdmin.username, sitesettings.testAdmin.password);
    navigation.clickServicesTab();
    utils.click(sitesettings.conferencing);
    navigation.expectCurrentUrl('/site-list');
  });

  it('should call XML API and allow click on configure site cog', function () {
    utils.wait(sitesettings.configureSJSITE14cog);
    utils.click(sitesettings.configureSJSITE14);
    navigation.expectCurrentUrl(sitesettings.siteSettingsUrl);
  });

  it('wait for WebEx settings index page to appear', function () {
    utils.wait(sitesettings.webexSiteSettingsPanel);
  });

  it('click on common settings cmr link', function () {
    utils.click(sitesettings.configureCommonCMRLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.webexCMRId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
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
