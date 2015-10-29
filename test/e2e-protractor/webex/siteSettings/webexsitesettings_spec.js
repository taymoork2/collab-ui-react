'use strict';

/* global describe, it, expect, login */

describe('WebEx site settings', function () {

  it('navigate to WebEx site list', function () {
    login.loginThroughGui(sitesettings.testAdmin.username, sitesettings.testAdmin.password);
    navigation.clickServicesTab();
    utils.click(sitesettings.conferencing);
    expect(sitesettings.configureSJSITE14.isPresent).toBeTruthy();
  });

  it('click on configure site cog', function () {
    utils.click(sitesettings.configureSJSITE14);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent).toBeTruthy();
  });

  it('click on site list breadcrumb', function () {
    utils.click(sitesettings.siteListCrumb);
    expect(sitesettings.configureSJSITE14.isPresent).toBeTruthy();
  });

  it('click on configure site cog', function () {
    utils.click(sitesettings.configureSJSITE14);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent).toBeTruthy();
  });

  it('click on common settings cmr link', function () {
    utils.click(sitesettings.configureCommonCMRLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCMRId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings company addresses link', function () {
    utils.click(sitesettings.configureCommonCompanyAddressesLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCompanyAddressesId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings disclaimers link', function () {
    utils.click(sitesettings.configureCommonDisclaimersLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexDisclaimersId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings email template link', function () {
    utils.click(sitesettings.configureCommonEmailTemplateLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexEmailTemplateId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings mobile link', function () {
    utils.click(sitesettings.configureCommonMobileLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonMobileId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings navigation customization link', function () {
    utils.click(sitesettings.configureCommonNavigationLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonNavigationId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings productivity tools link', function () {
    utils.click(sitesettings.configureCommonProductivityToolsLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonProductivityToolsId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings scheduler link', function () {
    utils.click(sitesettings.configureCommonSchedulerLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonSchedulerId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings security link', function () {
    utils.click(sitesettings.configureCommonSecurityLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonSecurityId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings session types link', function () {
    utils.click(sitesettings.configureCommonSessionTypesLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonSessionTypesId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings site options link', function () {
    utils.click(sitesettings.configureCommonSiteOptionsLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonSiteOptionsId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings user privileges link', function () {
    utils.click(sitesettings.configureCommonUserPrivLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonUserPrivId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on email all hosts btn', function () {
    utils.click(sitesettings.emailAllHostsBtn);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexEmailAllHostsId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on site features link', function () {
    utils.click(sitesettings.siteFeaturesLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexSiteFeaturesId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on site information link', function () {
    utils.click(sitesettings.siteInformationLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexSiteInformationId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on site list breadcrumb', function () {
    utils.click(sitesettings.siteListCrumb);
    expect(sitesettings.configureSJSITE14.isPresent).toBeTruthy();
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
