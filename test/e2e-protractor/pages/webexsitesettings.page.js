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
  this.emailAllHostsBtn = element(by.id('emailAllHostsBtn'));
  this.webexSiteSettingsPanel = element(by.css('#webexSiteSettings'));
  this.webexEmailAllHostsId = element(by.id('emailAllHosts'));
  this.siteSettingsBreadCrumbs = element(by.id('siteSettingsBreadCrumbs'));
  this.siteSettingBreadCrumbs = element(by.id('siteSettingBreadCrumbs'));
  this.siteListCrumb = element(by.id('siteListCrumb'));
  this.siteSettingsCrumb = element(by.id('siteSettingsCrumb'));

  this.isWebexSiteSettingsPanelPresent = function () {
    return browser.driver.isElementPresent(by.css('#webexSiteSettings'));
  };

  this.waitForWebexSiteSettingsPanel = function () {
    browser.driver.wait(this.isWebexSiteSettingsPanelPresent, TIMEOUT);
  };

  this.isSiteSettingsBreadCrumbsPresent = function () {
    return browser.driver.isElementPresent(by.id('siteSettingsBreadCrumbs'));
  };

  this.waitForSiteSettingsBreadCrumbs = function () {
    browser.driver.wait(this.isSiteSettingsBreadCrumbsPresent, TIMEOUT);
  };

  this.isWebexSiteSettingPanelPresent = function () {
    return browser.driver.isElementPresent(by.id('siteSetting'));
  };

  this.waitForWebexSiteSettingPanel = function () {
    return browser.driver.wait(this.isWebexSiteSettingPanelPresent, TIMEOUT);
  };

  this.isSiteSettingBreadCrumbsPresent = function () {
    return browser.driver.isElementPresent(by.id('siteSettingBreadCrumbs'));
  };

  this.waitForSiteSettingBreadCrumbs = function () {
    browser.driver.wait(this.isSiteSettingBreadCrumbsPresent, TIMEOUT);
  };

};

module.exports = SiteSettigsPage;
