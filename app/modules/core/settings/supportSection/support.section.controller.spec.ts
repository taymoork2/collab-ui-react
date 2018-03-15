import testModule from './index';
import { SupportSettingsController } from './support.section.controller';

describe('Controller: PartnerProfileCtrl', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$controller',
      '$rootScope',
      '$scope',
      '$q',
      'Authinfo',
      'BrandService',
      'FeatureToggleService',
      'Orgservice',
      'Notification',
      'UserListService',
      'WebexClientVersion',
      'ProPackService',
    );

    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.Orgservice, 'setOrgSettings').and.returnValue(this.$q.resolve());
    spyOn(this.UserListService, 'listPartners');
    spyOn(this.Orgservice, 'getOrg');
    spyOn(this.BrandService, 'getLogoUrl').and.returnValue(this.$q.resolve('logoUrl'));
    spyOn(this.FeatureToggleService, 'csdmDeviceSupportGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.WebexClientVersion, 'getWbxClientVersions').and.returnValue(this.$q.resolve());
    spyOn(this.WebexClientVersion, 'getPartnerIdGivenOrgId').and.returnValue(this.$q.resolve());
    spyOn(this.WebexClientVersion, 'getTemplate').and.returnValue(this.$q.resolve());

    this.initController = (): void => {
      this.controller = this.$controller(SupportSettingsController, {
        $scope: this.$scope,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  describe('validation()', function () {
    describe('showCustomHelpSiteSaveButton', function () {
      describe('checkBox enabled and url set', function () {
        beforeEach(function () {
          this.controller.customHelpSite.enable = true;
          this.controller.customHelpSite.url = 'initialUrl';
        });

        it('should not show save button if it was enabled with the same url', function () {
          this.controller.oldCustomHelpSite.enable = true;
          this.controller.oldCustomHelpSite.url = 'initialUrl';
          expect(this.controller.showCustomHelpSiteSaveButton).toBeFalsy();
        });

        it('should show save button if it was enabled with a different url', function () {
          this.controller.oldCustomHelpSite.enable = true;
          this.controller.oldCustomHelpSite.url = 'oldDifferentUrl';
          expect(this.controller.showCustomHelpSiteSaveButton).toBeTruthy();
        });

        it('should show save button if it was disabled', function () {
          this.controller.oldCustomHelpSite.enable = false;
          expect(this.controller.showCustomHelpSiteSaveButton).toBeTruthy();
        });

        it('should show not save button if it was disabled but has no url now', function () {
          this.controller.oldCustomHelpSite.enable = false;
          this.controller.customHelpSite.url = '';
          expect(this.controller.showCustomHelpSiteSaveButton).toBeFalsy();
        });
      });

      describe('checkBox disabled', function () {
        it('should not show save button if it was disabled', function () {
          this.controller.customHelpSite.enable = false;
          this.controller.oldCustomHelpSite.enable = false;

          expect(this.controller.showCustomHelpSiteSaveButton).toBeFalsy();
        });

        it('should show save button if it was enabled', function () {
          this.controller.customHelpSite.enable = false;
          this.controller.oldCustomHelpSite.enable = true;
          expect(this.controller.showCustomHelpSiteSaveButton).toBeTruthy();
        });
      });
    });

    describe('saving org settings data', function () {
      it('saves data via Orgservice', function () {
        this.controller.useCustomSupportUrl = this.controller.problemSiteInfo.cisco;
        this.controller.useCustomHelpSite = this.controller.helpSiteInfo.cisco;
        this.controller.useCustomSupportUrl = this.controller.problemSiteInfo.ext;
        this.controller.customSupport.url = 'supportUrl';
        this.controller.customSupport.text = 'this is support text';
        this.controller.allowReadOnlyAccess = false;
        this.controller.useCustomHelpSite = this.controller.helpSiteInfo.ext;
        this.controller.customHelpSite.url = 'helpUrl';
        this.controller.saveUseCustomHelpSite();
        this.controller.saveUseCustomSupportUrl();
        const expectedOrgSettingsPart1 = {
          reportingSiteUrl: 'supportUrl',
          reportingSiteDesc: 'this is support text',
          // helpUrl: 'helpUrl',
          // isCiscoHelp: false,
          isCiscoSupport: false,
          // allowReadOnlyAccess: false,
          // allowCrashLogUpload: false
        };
        const expectedOrgSettingsPart2 = {
          // reportingSiteUrl: 'supportUrl',
          // reportingSiteDesc: 'this is support text',
          helpUrl: 'helpUrl',
          isCiscoHelp: false,
          // isCiscoSupport: false,
          // allowReadOnlyAccess: false,
          // allowCrashLogUpload: false
        };

        expect(this.Orgservice.setOrgSettings).toHaveBeenCalledWith(null, expectedOrgSettingsPart1);
        expect(this.Orgservice.setOrgSettings).toHaveBeenCalledWith(null, expectedOrgSettingsPart2);
      });
    });

    describe('should save successfully', function () {
      afterEach(function () {
        this.controller.saveUseCustomHelpSite();
        this.controller.saveUseCustomSupportUrl();
        expect(this.controller.savingProgress).toEqual(true);
        this.$scope.$apply();
        expect(this.controller.savingProgress).toEqual(false);
        expect(this.Notification.success).toHaveBeenCalledWith('partnerProfile.processing');
      });

      it('with default cisco options', function () {
        this.controller.useCustomSupportUrl = this.controller.problemSiteInfo.cisco;
        this.controller.useCustomHelpSite = this.controller.helpSiteInfo.cisco;
      });

      it('with custom problem site', function () {
        this.controller.useCustomSupportUrl = this.controller.problemSiteInfo.ext;
        this.controller.supportUrl = 'supportUrl';
      });

      it('with custom help site', function () {
        this.controller.useCustomHelpSite = this.controller.helpSiteInfo.ext;
        this.controller.helpUrl = 'helpUrl';
      });
    });

    describe('should notify error response', function () {
      beforeEach(function () {
        this.Orgservice.setOrgSettings.and.returnValue(this.$q.reject({}));
      });

      it('when update fails', function () {
        this.controller.saveUseCustomHelpSite();
        this.controller.saveUseCustomSupportUrl();
        expect(this.controller.savingProgress).toEqual(true);
        this.$scope.$apply();
        expect(this.controller.savingProgress).toEqual(false);
        expect(this.Notification.errorResponse).toHaveBeenCalled();
      });
    });

    describe('should notify validation error', function () {
      afterEach(function () {
        this.controller.saveUseCustomHelpSite();
        this.controller.saveUseCustomSupportUrl();
        this.$scope.$apply();
        expect(this.Notification.error).toHaveBeenCalledWith('partnerProfile.orgSettingsError');
      });

      it('when picking a custom problem site without a value', function () {
        this.controller.useCustomSupportUrl = this.controller.problemSiteInfo.ext;
        this.controller.customSupport.url = '';
      });

      it('when picking a custom help site without a value', function () {
        this.controller.useCustomHelpSite = this.controller.helpSiteInfo.ext;
        this.controller.customHelpSite.url = '';
      });
    });

    describe('2017 name update', function () {
      it('getAppTitle should depend on hasProPackPurchased', function () {
        expect(this.controller.getAppTitle()).toEqual('loginPage.titleNew');

        this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
        this.initController();
        expect(this.controller.getAppTitle()).toEqual('loginPage.titlePro');
      });
    });
  });
});
