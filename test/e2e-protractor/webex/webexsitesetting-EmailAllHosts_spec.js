'use strict';

/* global describe, it, expect, login */

describe('WebEx Emaill All Hosts', function () {

  it('should allow login as admin user', function () {
    login.loginThroughGui(sitesettings.testAdmin.username, sitesettings.testAdmin.password);
  });

  it('click on services tab', function () {
    navigation.clickServicesTab();
  });

  it('click on conferencing option', function () {
    utils.click(sitesettings.conferencing);
  });

  it('click on configure site cog', function () {
    utils.click(sitesettings.configureSJSITE14);
  });

  it('wait for WebEx settings index page to appear', function () {
    utils.wait(sitesettings.webexSiteSettingsPanel);
  });

  it('click on email all hosts btn', function () {
    utils.click(sitesettings.emailAllHostsBtn);
  });

  it('wait for email all hosts page to appear', function () {
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.webexEmailAllHostsId.isPresent()).toBeTruthy();
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
