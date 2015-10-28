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
  this.emailAllHostsBtn = element(by.id('emailAllHostsBtn'));
  this.siteInformationLink = element(by.id('SiteInfo_site_info'));
  this.siteFeaturesLink = element(by.id('SiteInfo_site_features'));
  this.configureCommonUserPrivLink = element(by.id('CommonSettings_user_priv'));
  this.configureCommonSiteOptionsLink = element(by.id('CommonSettings_common_options'));
  this.configureCommonSessionTypesLink = element(by.id('CommonSettings_session_type'));
  this.configureCommonSecurityLink = element(by.id('CommonSettings_security'));
  this.configureCommonSchedulerLink = element(by.id('CommonSettings_scheduler'));
  this.configureCommonProductivityToolsLink = element(by.id('CommonSettings_productivity'));
  this.configureCommonNavigationLink = element(by.id('CommonSettings_navigation'));
  this.configureCommonMobileLink = element(by.id('CommonSettings_mobile'));
  this.configureCommonEmailTemplateLink = element(by.id('CommonSettings_email_template'));
  this.configureCommonDisclaimersLink = element(by.id('CommonSettings_disclaimer'));
  this.configureCommonCompanyAddressesLink = element(by.id('CommonSettings_address'));
  this.configureCommonCMRLink = element(by.id('CommonSettings_cmr'));
  this.iFramePage = element(by.id('webexIframeContainer'));
  this.webexSiteSettingsPanel = element(by.id('webexSiteSettings'));
  this.webexSiteInfoCardId = element(by.id('SiteInfo-card'));
  this.webexCommonSettingsCardId = element(by.id('CommonSettings-card'));
  this.webexEmailAllHostsId = element(by.id('EMAIL_send_email_to_all'));
  this.webexSiteInformationId = element(by.id('SiteInfo_site_info'));
  this.webexSiteFeaturesId = element(by.id('SiteInfo_site_features'));
  this.webexCommonUserPrivId = element(by.id('CommonSettings_user_priv'));
  this.webexCommonSiteOptionsId = element(by.id('CommonSettings_common_options'));
  this.webexCommonSessionTypesId = element(by.id('CommonSettings_session_type'));
  this.webexCommonSecurityId = element(by.id('CommonSettings_security'));
  this.webexCommonSchedulerId = element(by.id('CommonSettings_scheduler'));
  this.webexCommonProductivityToolsId = element(by.id('CommonSettings_productivity'));
  this.webexCommonNavigationId = element(by.id('CommonSettings_navigation'));
  this.webexCommonMobileId = element(by.id('CommonSettings_mobile'));
  this.webexEmailTemplateId = element(by.id('CommonSettings_email_template'));
  this.webexDisclaimersId = element(by.id('CommonSettings_disclaimer'));
  this.webexCompanyAddressesId = element(by.id('CommonSettings_address'));
  this.webexCMRId = element(by.id('CommonSettings_cmr'));
  this.siteSettingsBreadCrumbs = element(by.id('siteSettingsBreadCrumbs'));
  this.siteSettingBreadCrumbs = element(by.id('siteSettingBreadCrumbs'));
  this.siteListCrumb = element(by.id('siteListCrumb'));
  this.siteSettingsCrumb = element(by.id('siteSettingsCrumb'));
  this.xLaunchSiteAdminIcon = element(by.id('webexSiteAdminLink'));
};

module.exports = SiteSettigsPage;
