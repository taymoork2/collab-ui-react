'use strict';

/* global describe, it, expect, login */

describe('WebEx site settings', function () {

  it('should allow login as admin user', function () {
    login.loginThroughGui(sitesettings.testAdmin2.username, sitesettings.testAdmin2.password);
  });

  it('click on services tab', function () {
    navigation.clickServicesTab();
  });

  it('click on conferencing option', function () {
    utils.click(sitesettings.conferencing);
    navigation.expectCurrentUrl('/site-list');
  });

  it('wait for webex cross-launch icon', function () {
    sitesettings.waitSiteSettingsXLaunchIcon();
  });

  // TODO: additional tests to click on various setting page links on the site settings page

  // it('should pause', function () {
  //   browser.pause()
  // });

  it('should allow log out', function () {
    navigation.logout();
  });
});
