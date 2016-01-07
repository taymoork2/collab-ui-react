'use strict';

describe('WebEx site settings cross-launch', function () {
  it('should login as t30citestprov9@mailinator.com', function () {
    login.loginThroughGui(sitesettings.testAdmin2.username, sitesettings.testAdmin2.password);
  });

  it('should navigate to webex site list and find webex settings cross-launch icon', function () {
    navigation.clickServicesTab();
    utils.click(sitesettings.conferencing);
    expect(sitesettings.xLaunchSiteSettingsT30CITEST.isPresent).toBeTruthy();
  });

  it('should log out', function () {
    navigation.logout();
  });
});

describe('WebEx site settings iframe', function () {
  it('should login as sjsite14@mailinator.com ', function () {
    login.loginThroughGui(sitesettings.testAdmin.username, sitesettings.testAdmin.password);
  });

  it('should navigate to webex site list and find configure site cog', function () {
    navigation.clickServicesTab();
    utils.click(sitesettings.conferencing);
    utils.wait(sitesettings.configureSJSITE14);
  });

  it('should click on configure site cog and navigate to site settings index', function () {
    utils.click(sitesettings.configureSJSITE14);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent).toBeTruthy();
  });

  it('should click on site list breadcrumb and navigate to site list', function () {
    utils.click(sitesettings.siteListCrumb);
    expect(sitesettings.configureSJSITE14.isPresent).toBeTruthy();
  });

  it('should click on configure site cog and navigate to site settings index', function () {
    utils.click(sitesettings.configureSJSITE14);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent).toBeTruthy();
  });

  it('should click on common settings cmr link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonCMRLink);
    utils.wait(sitesettings.siteSettingPanel);
    utils.wait(sitesettings.cmrId);
    expect(sitesettings.cmrId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings company addresses link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonCompanyAddressesLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.companyAddressesId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings disclaimers link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonDisclaimersLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.disclaimersId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings email template link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonEmailTemplateLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.emaillTemplateId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings mobile link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonMobileLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.commonMobileId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings navigation customization link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonNavigationLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.commonNavigationId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings productivity tools link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonProductivityToolsLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.commonProductivityToolsId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings scheduler link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonSchedulerLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.commonSchedulerId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings security link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonSecurityLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.commonSecurityId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings session types link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonSessionTypesLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.commonSessionTypesId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings site options link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonSiteOptionsLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.commonSiteOptionsId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on common settings user privileges link and navigate to the correct site setting', function () {
    utils.click(sitesettings.configureCommonUserPrivLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.commonUserPrivId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on email all hosts btn and navigate to the correct site setting', function () {
    utils.click(sitesettings.emailAllHostsBtn);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.emaillAllHostsId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on site features link and navigate to the correct site setting', function () {
    utils.click(sitesettings.siteFeaturesLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.siteFeaturesId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on settings index breadcrumb and navigate to site settings index', function () {
    utils.click(sitesettings.siteSettingsCrumb);
    utils.wait(sitesettings.siteSettingsPanel);
    expect(sitesettings.siteInfoCardId.isPresent).toBeTruthy();
    expect(sitesettings.commonSettingsCardId.isPresent).toBeTruthy();
  });

  it('should click on site information link and navigate to the correct site setting', function () {
    utils.click(sitesettings.siteInformationLink);
    utils.wait(sitesettings.siteSettingPanel);
    expect(sitesettings.siteInformationId.isPresent()).toBeTruthy();
    expect(sitesettings.iFramePage.isPresent()).toBeTruthy();
    expect(sitesettings.siteSettingsCrumb.isPresent()).toBeTruthy();
    expect(sitesettings.siteListCrumb.isPresent()).toBeTruthy();
  });

  it('should click on site list breadcrumb and navigate to site list', function () {
    utils.click(sitesettings.siteListCrumb);
    utils.wait(sitesettings.configureSJSITE14);
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
