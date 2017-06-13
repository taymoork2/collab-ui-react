'use strict';

describe('Controller: PartnerProfileCtrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'WebExApp');
    this.injectDependencies(
      '$controller',
      '$q',
      '$scope',
      'Authinfo',
      'BrandService',
      'FeatureToggleService',
      'ITProPackService',
      'Notification',
      'Orgservice',
      'WebexClientVersion',
      'UserListService'
    );

    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.ITProPackService, 'hasITProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.Orgservice, 'setOrgSettings').and.returnValue(this.$q.resolve());
    spyOn(this.UserListService, 'listPartners');
    spyOn(this.Orgservice, 'getOrg');

    this.initController = function () {
      this.$controller('PartnerProfileCtrl', {
        $scope: this.$scope,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  describe('validation()', function () {
    describe('saving org settings data', function () {
      it('saves data via Orgservice', function () {
        this.$scope.problemSiteRadioValue = this.$scope.problemSiteInfo.cisco;
        this.$scope.helpSiteRadioValue = this.$scope.helpSiteInfo.cisco;
        this.$scope.problemSiteRadioValue = this.$scope.problemSiteInfo.ext;
        this.$scope.supportUrl = 'supportUrl';
        this.$scope.supportText = 'this is support text';
        this.$scope.helpSiteRadioValue = this.$scope.helpSiteInfo.ext;
        this.$scope.helpUrl = 'helpUrl';
        this.$scope.validation();

        expect(this.Orgservice.setOrgSettings).toHaveBeenCalledWith(null, {
          reportingSiteUrl: 'supportUrl',
          reportingSiteDesc: 'this is support text',
          helpUrl: 'helpUrl',
          isCiscoHelp: false,
          isCiscoSupport: false,
        });
      });
    });

    describe('should save successfully', function () {
      afterEach(function () {
        this.$scope.validation();
        expect(this.$scope.orgProfileSaveLoad).toEqual(true);
        this.$scope.$apply();
        expect(this.$scope.orgProfileSaveLoad).toEqual(false);
        expect(this.Notification.success).toHaveBeenCalledWith('partnerProfile.processing');
      });

      it('with default cisco options', function () {
        this.$scope.problemSiteRadioValue = this.$scope.problemSiteInfo.cisco;
        this.$scope.helpSiteRadioValue = this.$scope.helpSiteInfo.cisco;
      });

      it('with custom problem site', function () {
        this.$scope.problemSiteRadioValue = this.$scope.problemSiteInfo.ext;
        this.$scope.supportUrl = 'supportUrl';
      });

      it('with custom help site', function () {
        this.$scope.helpSiteRadioValue = this.$scope.helpSiteInfo.ext;
        this.$scope.helpUrl = 'helpUrl';
      });
    });

    describe('should notify error response', function () {
      beforeEach(function () {
        this.Orgservice.setOrgSettings.and.returnValue(this.$q.reject({}));
      });

      it('when update fails', function () {
        this.$scope.validation();
        expect(this.$scope.orgProfileSaveLoad).toEqual(true);
        this.$scope.$apply();
        expect(this.$scope.orgProfileSaveLoad).toEqual(false);
        expect(this.Notification.errorResponse).toHaveBeenCalled();
      });
    });

    describe('should notify validation error', function () {
      afterEach(function () {
        this.$scope.validation();
        this.$scope.$apply();
        expect(this.Notification.error).toHaveBeenCalledWith('partnerProfile.orgSettingsError');
      });

      it('when picking a custom problem site without a value', function () {
        this.$scope.problemSiteRadioValue = this.$scope.problemSiteInfo.ext;
        this.$scope.supportUrl = '';
      });

      it('when picking a custom help site without a value', function () {
        this.$scope.helpSiteRadioValue = this.$scope.helpSiteInfo.ext;
        this.$scope.helpUrl = '';
      });
    });

    describe('2017 name update', function () {
      it('nameChangeEnabled should depend on atlas2017NameChangeGetStatus', function () {
        expect(this.$scope.nameChangeEnabled).toBeFalsy();

        this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
        this.initController();
        expect(this.$scope.nameChangeEnabled).toBeTruthy();
      });

      it('getAppTitle should depend on hasITProPackPurchased', function () {
        expect(this.$scope.getAppTitle()).toEqual('loginPage.titleNew');

        this.ITProPackService.hasITProPackPurchased.and.returnValue(this.$q.resolve(true));
        this.initController();
        expect(this.$scope.getAppTitle()).toEqual('loginPage.titlePro');
      });
    });
  });
});
