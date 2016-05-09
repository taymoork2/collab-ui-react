'use strict';

/*global sitesettings*/

sitesettings.testInfo.describeCount = 0;
while (1 >= sitesettings.testInfo.describeCount) {
  switch (sitesettings.testInfo.describeCount) {
  case 1:
    sitesettings.testInfo.testType = 'T30';
    sitesettings.testInfo.describeText = 'WebEx site settings iframe test for ' + sitesettings.testInfo.testType + ' site ' + sitesettings.t30Info.siteUrl;
    break;

  default:
    sitesettings.testInfo.testType = 'T31';
    sitesettings.testInfo.describeText = 'WebEx site settings iframe test for ' + sitesettings.testInfo.testType + ' site ' + sitesettings.t31Info.siteUrl;
  }

  describe(sitesettings.testInfo.describeText, function () {

    if (sitesettings.testInfo.testType == "T31") {
      beforeAll(function () {
        login.login('t31RegressionTestAdmin');
      });
    } else {
      beforeAll(function () {
        login.login('t30RegressionTestAdmin');
      });
    }

    it('should navigate to webex site list', function () {
      navigation.clickServicesTab();
      utils.click(sitesettings.conferencing);
    });

    if (sitesettings.testInfo.testType == "T31") {
      it('should click on configure site icon for ' + sitesettings.t31Info.siteUrl, function () {
        utils.click(sitesettings.t31ConfigureCog);
        utils.wait(sitesettings.siteSettingsPanel);
        utils.wait(sitesettings.t31CardsSectionId);
      });
    } else {
      it('should click on configure site icon for ' + sitesettings.t30Info.siteUrl, function () {
        utils.click(sitesettings.t30ConfigureCog);
        utils.wait(sitesettings.siteSettingsPanel);
        utils.wait(sitesettings.t30CardsSectionId);
      });
    }

    it('should click on site list breadcrumb and navigate to site list', function () {
      utils.click(sitesettings.siteListCrumb);
    });

    if (sitesettings.testInfo.testType == "T31") {
      it('should click on configure site cog for ' + sitesettings.t31Info.siteUrl, function () {
        utils.click(sitesettings.t31ConfigureCog);
        utils.wait(sitesettings.siteSettingsPanel);
        utils.wait(sitesettings.t31CardsSectionId);
      });
    } else {
      it('should click on configure site cog for ' + sitesettings.t30Info.siteUrl, function () {
        utils.click(sitesettings.t30ConfigureCog);
        utils.wait(sitesettings.siteSettingsPanel);
        utils.wait(sitesettings.t30CardsSectionId);
      });
    }

    if (sitesettings.testInfo.testType == "T31") { // for T31 site only
      it('should click on common settings cmr link', function () {
        utils.click(sitesettings.configureCommonCMRLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.cmrId);
        utils.wait(sitesettings.iFramePage);
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      });

      it('should click on common settings scheduler link', function () {
        utils.click(sitesettings.configureCommonSchedulerLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonSchedulerId);
        utils.wait(sitesettings.iFramePage);
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      });

      it('should click on common settings security link ', function () {
        utils.click(sitesettings.configureCommonSecurityLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonSecurityId);
        utils.wait(sitesettings.iFramePage);
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      });

      it('should click on common settings session types link', function () {
        utils.click(sitesettings.configureCommonSessionTypesLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonSessionTypesId);
        utils.wait(sitesettings.iFramePage);
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      });

      it('should click on common settings user privileges link', function () {
        utils.click(sitesettings.configureCommonUserPrivLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonUserPrivId);
        utils.wait(sitesettings.iFramePage);
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      });
    } // For T31 site only

    it('should click on common settings company addresses link', function () {
      utils.click(sitesettings.configureCommonCompanyAddressesLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.companyAddressesId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on common settings disclaimers link', function () {
      utils.click(sitesettings.configureCommonDisclaimersLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.disclaimersId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    xit('should click on common settings email template link', function () {
      utils.click(sitesettings.configureCommonEmailTemplateLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.emaillTemplateId);
      utils.wait(sitesettings.iFramePage);
    });

    xit('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on common settings mobile link', function () {
      utils.click(sitesettings.configureCommonMobileLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.commonMobileId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on common settings navigation customization link', function () {
      utils.click(sitesettings.configureCommonNavigationLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.commonNavigationId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on common settings productivity tools link', function () {
      utils.click(sitesettings.configureCommonProductivityToolsLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.commonProductivityToolsId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on common settings site options link', function () {
      utils.click(sitesettings.configureCommonSiteOptionsLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.commonSiteOptionsId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on common settings site information link', function () {
      utils.click(sitesettings.configureCommonSiteInformationLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.commonSiteInformationId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on email all hosts btn', function () {
      utils.click(sitesettings.emailAllHostsBtn);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.emaillAllHostsId);
      utils.wait(sitesettings.iFramePage);
    });

    if (sitesettings.testInfo.testType == "T31") {
      it('should click on configure site cog and navigate to site settings index', function () {
        utils.click(sitesettings.siteListCrumb);
        utils.wait(sitesettings.t31ConfigureCog);
      });
    } else {
      it('should click on configure site cog and navigate to site settings index', function () {
        utils.click(sitesettings.siteListCrumb);
        utils.wait(sitesettings.t30ConfigureCog);
      });
    }

    // it('should pause', function () {
    //   browser.pause()
    // });

    afterAll(function () {
      navigation.logout();
    });
  });

  ++sitesettings.testInfo.describeCount;
}
