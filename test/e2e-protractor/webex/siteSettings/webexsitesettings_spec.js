'use strict';

sitesettings.testInfo.describeCount = 0;
while (1 >= sitesettings.testInfo.describeCount) {
  switch (sitesettings.testInfo.describeCount) {
  case 1:
    sitesettings.testInfo.siteType = 'T30';
    sitesettings.testInfo.siteUrl = "cisjsite002.cisco.com";
    sitesettings.testInfo.describeText = 'WebEx site settings iframe test for T30 site ' + sitesettings.siteUrl;
    sitesettings.testInfo.signInText = 'should signin as ' + sitesettings.testAdmin2.username + ' for T30 site config test';
    break;

  default:
    sitesettings.testInfo.siteType = 'T31';
    sitesettings.testInfo.siteUrl = "sjsite14.cisco.com";
    sitesettings.testInfo.describeText = 'WebEx site settings iframe test for T31 site ' + sitesettings.siteUrl;
    sitesettings.testInfo.signInText = 'should signin as ' + sitesettings.testAdmin1.username + ' for T31 site config test';
  }

  describe(sitesettings.testInfo.describeText, function () {
    afterEach(function () {
      utils.dumpConsoleErrors();
    });

    /*
    if (sitesettings.testInfo.siteType == "T31") {
      it(sitesettings.testInfo.signInText, function () {
        login.loginThroughGui(sitesettings.testAdmin1.username, sitesettings.testAdmin1.password);
      });
    } else {
      it(sitesettings.testInfo.signInText, function () {
        login.loginThroughGui(sitesettings.testAdmin2.username, sitesettings.testAdmin2.password);
      });
    }

    it('should navigate to webex site list and find the configure site cog for ' + sitesettings.testInfo.siteUrl, function () {
      navigation.clickServicesTab();
      utils.click(sitesettings.conferencing);
    });

    if (sitesettings.testInfo.siteType == "T31") {
      it('should click on configure site cog and navigate to site settings index', function () {
        utils.click(sitesettings.configureSJSITE14Cog);
        utils.wait(sitesettings.siteSettingsPanel);
      });
    } else {
      it('should click on configure site cog and navigate to site settings index', function () {
        utils.click(sitesettings.configureCISJSITE002Cog);
        utils.wait(sitesettings.siteSettingsPanel);
      });
    }

    it('should click on site list breadcrumb and navigate to site list', function () {
      utils.wait(sitesettings.siteListCrumb);
      utils.click(sitesettings.siteListCrumb);
    });

    if (sitesettings.testInfo.siteType == "T31") {
      it('should click on configure site cog and navigate to site settings index', function () {
        utils.click(sitesettings.configureSJSITE14Cog);
        utils.wait(sitesettings.siteSettingsPanel);
      });
    } else {
      it('should click on configure site cog and navigate to site settings index', function () {
        utils.click(sitesettings.configureCISJSITE002Cog);
        utils.wait(sitesettings.siteSettingsPanel);
      });
    }

    if (sitesettings.testInfo.siteType == "T31") { // for T31 site only
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
      utils.wait(sitesettings.siteSettingsCrumb);
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on common settings email template link', function () {
      utils.click(sitesettings.configureCommonEmailTemplateLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.emaillTemplateId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
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

    it('should click on email all hosts btn', function () {
      utils.click(sitesettings.emailAllHostsBtn);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.emaillAllHostsId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on site features link', function () {
      utils.click(sitesettings.siteFeaturesLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.siteFeaturesId);
      utils.wait(sitesettings.iFramePage);
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      utils.click(sitesettings.siteSettingsCrumb);
      utils.wait(sitesettings.siteSettingsPanel);
    });

    it('should click on site information link', function () {
      utils.click(sitesettings.siteInformationLink);
      utils.wait(sitesettings.siteSettingPanel);
      utils.wait(sitesettings.siteInformationId);
      utils.wait(sitesettings.iFramePage);
    });

    if (sitesettings.testInfo.siteType == "T31") {
      it('should click on configure site cog and navigate to site settings index', function () {
        utils.click(sitesettings.siteListCrumb);
        utils.wait(sitesettings.configureSJSITE14Cog);
      });
    } else {
      it('should click on configure site cog and navigate to site settings index', function () {
        utils.click(sitesettings.siteListCrumb);
        utils.wait(sitesettings.configureCISJSITE002Cog);
      });
    }

    // it('should pause', function () {
    //   browser.pause()
    // });

    it('should log out', function () {
      navigation.logout();
    });
    */
  });

  ++sitesettings.testInfo.describeCount;
}
