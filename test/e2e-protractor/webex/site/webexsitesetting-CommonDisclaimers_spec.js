'use strict';

/* global describe, it, expect, login */

describe('WebEx Common Settings -> Disclaimers', function () {

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
    utils.wait(sitesettings.webexSiteSettingsPanel);
  });

  it('click on common settings disclaimers link', function () {
    utils.click(sitesettings.configureCommonDisclaimersLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.webexDisclaimersId.isPresent()).toBeTruthy();
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
