'use strict';

describe('Controller: PartnerProfileCtrl', function () {
  var $scope, $controller, controller, $q;
  var Notification, Orgservice, UserListService, FeatureToggleService;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies($rootScope, _$controller_, _$q_, _Notification_, _Orgservice_, _UserListService_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
    UserListService = _UserListService_;
    FeatureToggleService = _FeatureToggleService_;
  }

  function initSpies() {
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorResponse');
    spyOn(Orgservice, 'setOrgSettings').and.returnValue($q.when());
    spyOn(UserListService, 'listPartners');
    spyOn(Orgservice, 'getOrg');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));
  }

  function initController() {
    controller = $controller('PartnerProfileCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }

  describe('validation()', function () {

    describe('saving org settings data', function () {

      it('saves data via Orgservice', function () {
        $scope.problemSiteRadioValue = $scope.problemSiteInfo.cisco;
        $scope.helpSiteRadioValue = $scope.helpSiteInfo.cisco;
        $scope.problemSiteRadioValue = $scope.problemSiteInfo.ext;
        $scope.supportUrl = 'supportUrl';
        $scope.supportText = 'this is support text';
        $scope.allowReadOnlyAccess = false;
        $scope.helpSiteRadioValue = $scope.helpSiteInfo.ext;
        $scope.helpUrl = 'helpUrl';
        $scope.validation();
        var expectedOrgSettings = {
          reportingSiteUrl: 'supportUrl',
          reportingSiteDesc: 'this is support text',
          helpUrl: 'helpUrl',
          isCiscoHelp: false,
          isCiscoSupport: false,
          allowReadOnlyAccess: false,
          allowCrashLogUpload: false
        };
        expect(Orgservice.setOrgSettings).toHaveBeenCalledWith(null, expectedOrgSettings);
      });

    });

    describe('should save successfully', function () {
      afterEach(saveAndNotifySuccess);

      it('with default cisco options', function () {
        $scope.problemSiteRadioValue = $scope.problemSiteInfo.cisco;
        $scope.helpSiteRadioValue = $scope.helpSiteInfo.cisco;
      });

      it('with custom problem site', function () {
        $scope.problemSiteRadioValue = $scope.problemSiteInfo.ext;
        $scope.supportUrl = 'supportUrl';
      });

      it('with custom help site', function () {
        $scope.helpSiteRadioValue = $scope.helpSiteInfo.ext;
        $scope.helpUrl = 'helpUrl';
      });

      function saveAndNotifySuccess() {
        $scope.validation();
        expect($scope.orgProfileSaveLoad).toEqual(true);
        $scope.$apply();
        expect($scope.orgProfileSaveLoad).toEqual(false);
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
        $scope.validation();
        expect($scope.orgProfileSaveLoad).toEqual(true);
        $scope.$apply();
        expect($scope.orgProfileSaveLoad).toEqual(false);
        expect(Notification.errorResponse).toHaveBeenCalled();
      }
    });

    describe('should notify validation error', function () {
      afterEach(saveAndNotifyError);

      it('when picking a custom problem site without a value', function () {
        $scope.problemSiteRadioValue = $scope.problemSiteInfo.ext;
        $scope.supportUrl = '';
      });

      it('when picking a custom help site without a value', function () {
        $scope.helpSiteRadioValue = $scope.helpSiteInfo.ext;
        $scope.helpUrl = '';
      });

      function saveAndNotifyError() {
        $scope.validation();
        $scope.$apply();
        expect(Notification.error).toHaveBeenCalledWith('partnerProfile.orgSettingsError');
      }
    });
  });

});
