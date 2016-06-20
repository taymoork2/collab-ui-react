'use strict';

/* global sitesettings */
/* global webEx */

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

  xdescribe(sitesettings.testInfo.describeText, function () {
    var setup = false;

    if (sitesettings.testInfo.testType == "T31") {
      beforeAll(function () {
        /*
        login.loginUsingIntegrationBackend('t31RegressionTestAdmin');
        setup = true;
        */
        var promise = webEx.setup(
          1,
          't31RegressionTestAdmin',
          sitesettings.t31Info.testAdminUsername,
          sitesettings.t31Info.testAdminPassword,
          sitesettings.t31Info.siteUrl
        );

        promise.then(
          function success(ticket) {
            setup = (null !== ticket);
          },

          function error() {
            setup = false;
          }
        );
      });
    } else {
      beforeAll(function () {
        /*
        login.loginUsingIntegrationBackend('t30RegressionTestAdmin');
        setup = true;
        */
        var promise = webEx.setup(
          1,
          't30RegressionTestAdmin',
          sitesettings.t30Info.testAdminUsername,
          sitesettings.t30Info.testAdminPassword,
          sitesettings.t30Info.siteUrl
        );

        promise.then(
          function success(ticket) {
            setup = (null !== ticket);
          },

          function error() {
            setup = false;
          }
        );
      });
    }

    if (sitesettings.testInfo.testType == "T31") {
      it('shsetupould sign in as ' + sitesettings.t31Info.testAdminUsername + ' and navigate to webex site list', function () {
        if (setup) {
          navigation.clickServicesTab();
          utils.click(sitesettings.conferencing);
        }
      });

      it('should click on configure site icon for ' + sitesettings.t31Info.siteUrl, function () {
        if (setup) {
          utils.click(sitesettings.t31ConfigureCog);
          utils.wait(sitesettings.siteSettingsPanel);
          utils.wait(sitesettings.t31CardsSectionId);
        }
      });
    } else {
      it('should sign in as ' + sitesettings.t30Info.testAdminUsername + ' and navigate to webex site list', function () {
        if (setup) {
          navigation.clickServicesTab();
          utils.click(sitesettings.conferencing);
        }
      });

      it('should click on configure site icon for ' + sitesettings.t30Info.siteUrl, function () {
        if (setup) {
          utils.click(sitesettings.t30ConfigureCog);
          utils.wait(sitesettings.siteSettingsPanel);
          utils.wait(sitesettings.t30CardsSectionId);
        }
      });
    }

    it('should click on site list breadcrumb and navigate to site list', function () {
      if (setup) {
        utils.click(sitesettings.siteListCrumb);
      }
    });

    if (sitesettings.testInfo.testType == "T31") {
      it('should click on configure site cog for ' + sitesettings.t31Info.siteUrl, function () {
        if (setup) {
          utils.click(sitesettings.t31ConfigureCog);
          utils.wait(sitesettings.siteSettingsPanel);
          utils.wait(sitesettings.t31CardsSectionId);
        }
      });
    } else {
      it('should click on configure site cog for ' + sitesettings.t30Info.siteUrl, function () {
        if (setup) {
          utils.click(sitesettings.t30ConfigureCog);
          utils.wait(sitesettings.siteSettingsPanel);
          utils.wait(sitesettings.t30CardsSectionId);
        }
      });
    }

    if (sitesettings.testInfo.testType == "T31") { // for T31 site only
      it('should click on common settings cmr link', function () {
        if (setup) {
          utils.click(sitesettings.configureCommonCMRLink);
          utils.wait(sitesettings.siteSettingPanel);
          utils.wait(sitesettings.cmrId);
          utils.wait(sitesettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(sitesettings.siteSettingsCrumb);
          utils.wait(sitesettings.siteSettingsPanel);
        }
      });

      it('should click on common settings scheduler link', function () {
        if (setup) {
          utils.click(sitesettings.configureCommonSchedulerLink);
          utils.wait(sitesettings.siteSettingPanel);
          utils.wait(sitesettings.commonSchedulerId);
          utils.wait(sitesettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(sitesettings.siteSettingsCrumb);
          utils.wait(sitesettings.siteSettingsPanel);
        }
      });

      it('should click on common settings security link ', function () {
        if (setup) {
          utils.click(sitesettings.configureCommonSecurityLink);
          utils.wait(sitesettings.siteSettingPanel);
          utils.wait(sitesettings.commonSecurityId);
          utils.wait(sitesettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(sitesettings.siteSettingsCrumb);
          utils.wait(sitesettings.siteSettingsPanel);
        }
      });

      it('should click on common settings session types link', function () {
        if (setup) {
          utils.click(sitesettings.configureCommonSessionTypesLink);
          utils.wait(sitesettings.siteSettingPanel);
          utils.wait(sitesettings.commonSessionTypesId);
          utils.wait(sitesettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(sitesettings.siteSettingsCrumb);
          utils.wait(sitesettings.siteSettingsPanel);
        }
      });

      it('should click on common settings user privileges link', function () {
        if (setup) {
          utils.click(sitesettings.configureCommonUserPrivLink);
          utils.wait(sitesettings.siteSettingPanel);
          utils.wait(sitesettings.commonUserPrivId);
          utils.wait(sitesettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(sitesettings.siteSettingsCrumb);
          utils.wait(sitesettings.siteSettingsPanel);
        }
      });
    } // For T31 site only

    it('should click on common settings company addresses link', function () {
      if (setup) {
        utils.click(sitesettings.configureCommonCompanyAddressesLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.companyAddressesId);
        utils.wait(sitesettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      }
    });

    it('should click on common settings disclaimers link', function () {
      if (setup) {
        utils.click(sitesettings.configureCommonDisclaimersLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.disclaimersId);
        utils.wait(sitesettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      }
    });

    it('should click on common settings mobile link', function () {
      if (setup) {
        utils.click(sitesettings.configureCommonMobileLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonMobileId);
        utils.wait(sitesettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      }
    });

    it('should click on common settings navigation customization link', function () {
      if (setup) {
        utils.click(sitesettings.configureCommonNavigationLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonNavigationId);
        utils.wait(sitesettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      }
    });

    it('should click on common settings productivity tools link', function () {
      if (setup) {
        utils.click(sitesettings.configureCommonProductivityToolsLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonProductivityToolsId);
        utils.wait(sitesettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      }
    });

    it('should click on common settings partner delegated authentication link', function () {
      if (setup) {
        utils.click(sitesettings.configureCommonPartnerAuthLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonPartnerAuthId);
        utils.wait(sitesettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      }
    });

    it('should click on common settings site options link', function () {
      if (setup) {
        utils.click(sitesettings.configureCommonSiteOptionsLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonSiteOptionsId);
        utils.wait(sitesettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      }
    });

    it('should click on common settings site information link', function () {
      if (setup) {
        utils.click(sitesettings.configureCommonSiteInformationLink);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.commonSiteInformationId);
        utils.wait(sitesettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(sitesettings.siteSettingsCrumb);
        utils.wait(sitesettings.siteSettingsPanel);
      }
    });

    it('should click on email all hosts btn', function () {
      if (setup) {
        utils.click(sitesettings.emailAllHostsBtn);
        utils.wait(sitesettings.siteSettingPanel);
        utils.wait(sitesettings.emaillAllHostsId);
        utils.wait(sitesettings.iFramePage);
      }
    });

    if (sitesettings.testInfo.testType == "T31") {
      it('should click on configure site cog and navigate to site settings index', function () {
        if (setup) {
          utils.click(sitesettings.siteListCrumb);
          utils.wait(sitesettings.t31ConfigureCog);
        }
      });
    } else {
      it('should click on configure site cog and navigate to site settings index', function () {
        if (setup) {
          utils.click(sitesettings.siteListCrumb);
          utils.wait(sitesettings.t30ConfigureCog);
        }
      });
    }

    // it('should pause', function () {
    //   browser.pause()
    // });

    it('should allow log out', function () {
      navigation.logout();
    });
  });

  ++sitesettings.testInfo.describeCount;
}
