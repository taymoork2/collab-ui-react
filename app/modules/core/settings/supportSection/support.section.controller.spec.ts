namespace globalsettings {

  describe('Controller: PartnerProfileCtrl', ()=> {
    let $scope, $controller, controller, $q;
    let Notification, Orgservice, UserListService, BrandService, FeatureToggleService, WebexClientVersion;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));
    beforeEach(angular.mock.module('WebExApp'));
    beforeEach(inject(dependencies));
    beforeEach(initSpies);
    beforeEach(initController);

    function dependencies($rootScope, _$controller_, _$q_, _Notification_, _Orgservice_, _UserListService_, _BrandService_, _FeatureToggleService_, _WebexClientVersion_) {
      $scope = $rootScope.$new();
      $controller = _$controller_;
      $q = _$q_;
      Notification = _Notification_;
      Orgservice = _Orgservice_;
      UserListService = _UserListService_;
      BrandService = _BrandService_;
      FeatureToggleService = _FeatureToggleService_;
      WebexClientVersion = _WebexClientVersion_;
    }

    function initSpies() {
      spyOn(Notification, 'success');
      spyOn(Notification, 'error');
      spyOn(Notification, 'errorResponse');
      spyOn(Orgservice, 'setOrgSettings').and.returnValue($q.when());
      spyOn(UserListService, 'listPartners');
      spyOn(Orgservice, 'getOrg');
      spyOn(BrandService, 'getLogoUrl').and.returnValue($q.when('logoUrl'));
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));
      spyOn(WebexClientVersion, 'getWbxClientVersions').and.returnValue($q.when());
      spyOn(WebexClientVersion, 'getPartnerIdGivenOrgId').and.returnValue($q.when());
      spyOn(WebexClientVersion, 'getTemplate').and.returnValue($q.when());
    }

    function initController() {
      controller = $controller('SupportSettings', {
        $scope: $scope
      });
      $scope.$apply();
    }

    describe('validation()', ()=> {

      describe('saving org settings data', ()=> {

        it('saves data via Orgservice', ()=> {
          controller.useCustomSupportUrl = controller.problemSiteInfo.cisco;
          controller.useCustomHelpSite = controller.helpSiteInfo.cisco;
          controller.useCustomSupportUrl = controller.problemSiteInfo.ext;
          controller.customSupport.url = 'supportUrl';
          controller.customSupport.text = 'this is support text';
          controller.allowReadOnlyAccess = false;
          controller.useCustomHelpSite = controller.helpSiteInfo.ext;
          controller.customHelpSite.url = 'helpUrl';
          controller.saveUseCustomHelpSite();
          controller.saveUseCustomSupportUrl();
          let expectedOrgSettingsPart1 = {
            reportingSiteUrl: 'supportUrl',
            reportingSiteDesc: 'this is support text',
            // helpUrl: 'helpUrl',
            // isCiscoHelp: false,
            isCiscoSupport: false,
            // allowReadOnlyAccess: false,
            // allowCrashLogUpload: false
          };
          let expectedOrgSettingsPart2 = {
            // reportingSiteUrl: 'supportUrl',
            // reportingSiteDesc: 'this is support text',
            helpUrl: 'helpUrl',
            isCiscoHelp: false,
            // isCiscoSupport: false,
            // allowReadOnlyAccess: false,
            // allowCrashLogUpload: false
          };

          expect(Orgservice.setOrgSettings).toHaveBeenCalledWith(null, expectedOrgSettingsPart1);
          expect(Orgservice.setOrgSettings).toHaveBeenCalledWith(null, expectedOrgSettingsPart2);
        });

      });

      describe('should save successfully', ()=> {
        afterEach(()=> {
          saveAndNotifySuccess();
        });

        it('with default cisco options', ()=> {
          controller.useCustomSupportUrl = controller.problemSiteInfo.cisco;
          controller.useCustomHelpSite = controller.helpSiteInfo.cisco;
        });

        it('with custom problem site', ()=> {
          controller.useCustomSupportUrl = controller.problemSiteInfo.ext;
          controller.supportUrl = 'supportUrl';
        });

        it('with custom help site', ()=> {
          controller.useCustomHelpSite = controller.helpSiteInfo.ext;
          controller.helpUrl = 'helpUrl';
        });

        function saveAndNotifySuccess() {
          controller.saveUseCustomHelpSite();
          controller.saveUseCustomSupportUrl();
          expect(controller.savingProgress).toEqual(true);
          $scope.$apply();
          expect(controller.savingProgress).toEqual(false);
          expect(Notification.success).toHaveBeenCalledWith('partnerProfile.processing');
        }
      });

      describe('should notify error response', ()=> {
        beforeEach(initSpyFailure);

        it('when update fails', saveAndNotifyErrorResponse);

        function initSpyFailure() {
          Orgservice.setOrgSettings.and.returnValue($q.reject({}));
        }

        function saveAndNotifyErrorResponse() {
          controller.saveUseCustomHelpSite();
          controller.saveUseCustomSupportUrl();
          expect(controller.savingProgress).toEqual(true);
          $scope.$apply();
          expect(controller.savingProgress).toEqual(false);
          expect(Notification.errorResponse).toHaveBeenCalled();
        }
      });

      describe('should notify validation error', ()=> {
        afterEach(saveAndNotifyError);

        it('when picking a custom problem site without a value', ()=> {
          controller.useCustomSupportUrl = controller.problemSiteInfo.ext;
          controller.customSupport.url = '';
        });

        it('when picking a custom help site without a value', ()=> {
          controller.useCustomHelpSite = controller.helpSiteInfo.ext;
          controller.customHelpSite.url = '';
        });

        function saveAndNotifyError() {
          controller.saveUseCustomHelpSite();
          controller.saveUseCustomSupportUrl();
          $scope.$apply();
          expect(Notification.error).toHaveBeenCalledWith('partnerProfile.orgSettingsError');
        }
      });
    });

  });
}
