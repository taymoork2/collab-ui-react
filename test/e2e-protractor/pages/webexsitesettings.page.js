/**
 * 
 */
'use strict';

var SiteSettigsPage = function () {

  this.testAdmin = {
    username: 'monika@mfs.com',
    password: 'P@ssword123',
  };
  this.conferencing = element(by.css('a[href="#site-list"]'));
  this.configureSite = element(by.css('a[href="#/webexSiteSettings"]'));
  this.webexSiteSettingsPanel = element(by.css('#webexSiteSettings'));

  this.isWebexSiteSettingsPanelPresent = function () {
    return browser.driver.isElementPresent(by.css('#webexSiteSettings'));
  };
  this.waitForWebexSiteSettingsPanel = function () {
    browser.driver.wait(this.isWebexSiteSettingsPanelPresent, TIMEOUT);
  };
};

module.exports = SiteSettigsPage;
