namespace globalsettings {

  fdescribe('Controller: PartnerProfileCtrl', function () {
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

    describe('validation()', function () {

      describe('saving org settings data', function () {

        it('saves data via Orgservice', function () {
          controller.useCustomSupportUrl = controller.problemSiteInfo.cisco;
          controller.useCustomHelpSite = controller.helpSiteInfo.cisco;
          controller.useCustomSupportUrl = controller.problemSiteInfo.ext;
          controller.supportUrl = 'supportUrl';
          controller.supportText = 'this is support text';
          controller.allowReadOnlyAccess = false;
          controller.useCustomHelpSite = controller.helpSiteInfo.ext;
          controller.helpUrl = 'helpUrl';
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

      describe('should save successfully', function () {
        afterEach(()=> {
          saveAndNotifySuccess();
        });

        it('with default cisco options', function () {
          controller.useCustomSupportUrl = controller.problemSiteInfo.cisco;
          controller.useCustomHelpSite = controller.helpSiteInfo.cisco;
        });

        it('with custom problem site', function () {
          controller.useCustomSupportUrl = controller.problemSiteInfo.ext;
          controller.supportUrl = 'supportUrl';
        });

        it('with custom help site', function () {
          controller.useCustomHelpSite = controller.helpSiteInfo.ext;
          controller.helpUrl = 'helpUrl';
        });

        function saveAndNotifySuccess() {
          controller.saveUseCustomHelpSite();
          controller.saveUseCustomSupportUrl();
          expect(controller.orgProfileSaveLoad).toEqual(true);
          $scope.$apply();
          expect(controller.orgProfileSaveLoad).toEqual(false);
          expect(Notification.success).toHaveBeenCalledWith('partnerProfile.processing');
        }
      });

      describe('should notify error response', function () {
        beforeEach(initSpyFailure);

        it('when update fails', saveAndNotifyErrorResponse);

        function initSpyFailure() {
          Orgservice.setOrgSettings.and.returnValue($q.reject({}));
        }

        function saveAndNotifyErrorResponse() {
          controller.saveUseCustomHelpSite();
          controller.saveUseCustomSupportUrl();
          expect(controller.orgProfileSaveLoad).toEqual(true);
          $scope.$apply();
          expect(controller.orgProfileSaveLoad).toEqual(false);
          expect(Notification.errorResponse).toHaveBeenCalled();
        }
      });

      describe('should notify validation error', function () {
        afterEach(saveAndNotifyError);

        it('when picking a custom problem site without a value', function () {
          controller.useCustomSupportUrl = controller.problemSiteInfo.ext;
          controller.supportUrl = '';
        });

        it('when picking a custom help site without a value', function () {
          controller.useCustomHelpSite = controller.helpSiteInfo.ext;
          controller.helpUrl = '';
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
