'use strict';

/* global describe, it, expect, login */

describe('WebEx site settings cross-launch', function () {
  it('should login as t30citestprov9@mailinator.com and navigate to WebEx site list', function () {
    login.loginThroughGui(sitesettings.testAdmin2.username, sitesettings.testAdmin2.password);
    navigation.clickServicesTab();
    utils.click(sitesettings.conferencing);
    navigation.expectCurrentUrl('/site-list');
  });

  it('should find webex settings cross-launch icon', function () {
    expect(sitesettings.xLaunchSiteSettingsT30CITEST.isPresent).toBeTruthy();
  });

  it('should log out', function () {
    navigation.logout();
  });
});

describe('WebEx site settings iframe', function () {
  it('should login as sjsite14@mailinator.com and navigate to WebEx site list', function () {
    login.loginThroughGui(sitesettings.testAdmin.username, sitesettings.testAdmin.password);
    navigation.clickServicesTab();
    utils.click(sitesettings.conferencing);
    expect(sitesettings.configureSJSITE14.isPresent).toBeTruthy();
  });

  it('click on configure site cog and should navigate to site settings index', function () {
    utils.click(sitesettings.configureSJSITE14);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent).toBeTruthy();
  });

  it('click on site list breadcrumb and should navigate to site list', function () {
    utils.click(sitesettings.siteListCrumb);
    expect(sitesettings.configureSJSITE14.isPresent).toBeTruthy();
  });

  it('click on configure site cog and should navigate to site settings index', function () {
    utils.click(sitesettings.configureSJSITE14);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent).toBeTruthy();
  });

  it('click on common settings cmr link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonCMRLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCMRId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings company addresses link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonCompanyAddressesLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCompanyAddressesId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings disclaimers link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonDisclaimersLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexDisclaimersId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings email template link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonEmailTemplateLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexEmailTemplateId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings mobile link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonMobileLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonMobileId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings navigation customization link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonNavigationLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonNavigationId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings productivity tools link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonProductivityToolsLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonProductivityToolsId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings scheduler link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonSchedulerLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonSchedulerId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings security link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonSecurityLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonSecurityId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings session types link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonSessionTypesLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonSessionTypesId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings site options link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonSiteOptionsLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonSiteOptionsId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on common settings user privileges link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonUserPrivLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexCommonUserPrivId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  /*
  it('click on email all hosts btn and should navigate to the correct site setting', function () {
    utils.click(sitesettings.emailAllHostsBtn);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexEmailAllHostsId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });
  */

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on site features link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.siteFeaturesLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexSiteFeaturesId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on settings index breadcrumb and should navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    expect(sitesettings.webexSiteSettingsPanel.isPresent).toBeTruthy();
    expect(sitesettings.webexSiteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.webexCommonSettingsCardId.isPresent).toBeTruthy();
  });

  it('click on site information link and should navigate to the correct site setting', function () {
    utils.click(sitesettings.siteInformationLink);
    expect(sitesettings.siteSettingPanel.isPresent()).toBeTruthy();
    expect(sitesettings.webexSiteInformationId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('click on site list breadcrumb and should navigate to site list', function () {
    utils.click(sitesettings.siteListCrumb);
    expect(sitesettings.configureSJSITE14.isPresent).toBeTruthy();
  });

  /**  
    it('should pause', function () {
      browser.pause()
    });
  **/

  it('should log out', function () {
    navigation.logout();
  });
});
