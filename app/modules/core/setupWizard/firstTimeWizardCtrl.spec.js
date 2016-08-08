'use strict';

describe('FirstTimeWizardCtrl', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var $controller, $q, $scope, Auth, Authinfo, FeatureToggleService, Userservice;

  beforeEach(inject(function (_$controller_, _$q_, $rootScope, _Auth_, _Authinfo_,
    _FeatureToggleService_, _Userservice_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();
    Auth = _Auth_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;
  }));

  describe('Customer Org Admin', function () {

    var successResponse = {
      data: {
        id: 'admin-user',
        roles: 'full_admin',
        entitlements: ['spark']
      },
      status: 200
    };
    var failedResponse = {
      data: '',
      status: 404
    };

    function initController() {
      $controller('FirstTimeWizardCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }

    function initControllerWith(data) {
      FeatureToggleService.atlasCareTrialsGetStatus.and.returnValue($q.when(data.atlasCareTrialsOn));
      Authinfo.isInDelegatedAdministrationOrg.and.returnValue(data.asDelegatedAdmin);
      Authinfo.getCareServices.and.returnValue(data.careServices);
      Userservice.getUser.and.returnValue($q.when(data.getUserResponse));
      Userservice.updateUserProfile.and.returnValue($q.when(data.updateUserProfileResponse));
      initController();
    }

    beforeEach(function () {
      spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus');
      spyOn(Userservice, 'getUser');
      spyOn(Userservice, 'updateUserProfile');
      spyOn(Authinfo, 'isInDelegatedAdministrationOrg');
      spyOn(Authinfo, 'getCareServices');
      spyOn(Authinfo, 'getOrgId').and.returnValue('care-org');
      spyOn(Auth, 'logout').and.stub();
    });

    it('should not check care feature toggle, if isInDelegatedAdministrationOrg is true', function () {
      initControllerWith({
        asDelegatedAdmin: true
      });

      // We will handle partner scenarios later.
      expect(FeatureToggleService.atlasCareTrialsGetStatus).not.toHaveBeenCalled();
    });

    it('should not get user details if there are no care licenses', function () {
      initControllerWith({
        asDelegatedAdmin: false,
        atlasCareTrialsOn: true,
        careServices: []
      });

      expect(Authinfo.getCareServices).toHaveBeenCalled();
      expect(Userservice.getUser).not.toHaveBeenCalled();
    });

    it('should not patch user if get user failed', function () {
      initControllerWith({
        asDelegatedAdmin: false,
        atlasCareTrialsOn: true,
        careServices: [{
          type: 'CDC_xxx'
        }],
        getUserResponse: failedResponse
      });

      expect(Authinfo.getCareServices).toHaveBeenCalled();
      expect(Userservice.getUser).toHaveBeenCalled();
      expect(Userservice.updateUserProfile).not.toHaveBeenCalled();
    });

    it('do not logout if patch user failed', function () {
      initControllerWith({
        asDelegatedAdmin: false,
        atlasCareTrialsOn: true,
        careServices: [{
          type: 'CDC_xxx'
        }],
        getUserResponse: successResponse,
        updateUserProfileResponse: failedResponse
      });

      expect(Authinfo.getCareServices).toHaveBeenCalled();
      expect(Userservice.getUser).toHaveBeenCalled();
      expect(Userservice.updateUserProfile).toHaveBeenCalled();
      expect(Auth.logout).not.toHaveBeenCalled();
    });

    it('should proceed to patch & logout if care admin does not have care roles & care ' +
      'entitlements',
      function () {
        initControllerWith({
          asDelegatedAdmin: false,
          atlasCareTrialsOn: true,
          careServices: [{
            type: 'CDC_xxx'
          }],
          getUserResponse: successResponse,
          updateUserProfileResponse: successResponse
        });

        expect(Auth.logout).toHaveBeenCalled();
      });
  });
});
