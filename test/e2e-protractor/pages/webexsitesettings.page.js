/**
 * 
 */
'use strict';

var SiteSettigsPage = function () {

  this.testAdmin = {
    username: 'sjsite14@mailinator.com',
    password: 'Cisco!23',
  };
  this.conferencing = element(by.css('a[href="#site-list"]'));
  this.configureSite = element(by.css('a[href="#/webexSiteSettings"]'));
  this.webexSiteSettingsPanel = element(by.css('#webexSiteSettings'));
  this.siteConfigBreadCrumbs = element(by.id('siteListCrumb'));
  this.siteConfigFirstCrumb = element(by.id('siteListCrumb'));

  this.isWebexSiteSettingsPanelPresent = function () {
    return browser.driver.isElementPresent(by.css('#webexSiteSettings'));
  };
  this.waitForWebexSiteSettingsPanel = function () {
    browser.driver.wait(this.isWebexSiteSettingsPanelPresent, TIMEOUT);
  };
  this.isSiteConfigBreadCrumbsPanelPresent = function () {
    return browser.driver.isElementPresent(by.id('siteListCrumb'));
  };
  this.waitForSiteConfigBreadCrumbsPanel = function () {
    browser.driver.wait(this.isSiteConfigBreadCrumbsPanelPresent, TIMEOUT);
  };
};

module.exports = SiteSettigsPage;
