/**
 * 
 */
'use strict';

var SiteSettigsPage = function () {

  this.testAdmin = {
    username: 'sjsite14@mailinator.com',
    password: 'Cisco!23',
  };

  this.testAdmin2 = {
    username: 'monika@mfs.com',
    password: 'P@ssword123',
  }

  this.conferencing = element(by.css('a[href="#site-list"]'));
  this.configureSite = element(by.css('a[href="#/webexSiteSettings"]'));
  this.siteSettingsUrl = '/site_settings';
  this.siteSettingPanel = element(by.id('siteSetting'));
  this.configureSJSITE14 = element(by.id("sjsite14.webex.com_webex-site-settings"));
  this.configureEmailAllHostsBtn = element(by.id('emailAllHostsBtn'));
  this.configureCommonSiteOptionsLink = element(by.id('CommonSettings_common_options'));
  this.iFramePage = element(by.id('webexIframeContainer'));
  this.siteReports = element(by.css('#webex-reports-list-iframe'));
  this.webexSiteSettingsPanel = element(by.css('#webexSiteSettings'));
  this.webexEmailAllHostsId = element(by.id('EMAIL_send_email_to_all'));
  this.webexCommonSiteOptionsId = element(by.id('CommonSettings_common_options'));
  this.siteSettingsBreadCrumbs = element(by.id('siteSettingsBreadCrumbs'));
  this.siteSettingBreadCrumbs = element(by.id('siteSettingBreadCrumbs'));
  this.siteListCrumb = element(by.id('siteListCrumb'));
  this.siteSettingsCrumb = element(by.id('siteSettingsCrumb'));
  this.webexReportCrumb = element(by.id('webexReportCrumb'))
  this.webexReportBreadCrumbs = element(by.id('webexReportBreadCrumbs'));
  this.meetingUsageReportLink = element(by.id('meeting_usage'));
  this.webexReportIFrameBreadCrumbs = element(by.id('webexReportIFrameBreadCrumbs'));
  this.webexReportIFrameCrumb2 = element(by.id('webexReportIFrameCrumb2'));
  this.siteAdminReportsUrl = '/webexreports';
  this.xLaunchSiteAdminIcon = element(by.id('webexSiteAdminLink'));

};

module.exports = SiteSettigsPage;
