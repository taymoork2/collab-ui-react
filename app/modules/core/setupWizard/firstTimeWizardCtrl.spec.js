'use strict';

describe('FirstTimeWizardCtrl', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var $controller, $q, $scope, Auth, Authinfo, Userservice;

  afterEach(function () {
    $controller = $q = $scope = Auth = Authinfo = Userservice = undefined;
  });

  beforeEach(inject(function (_$controller_, _$q_, $rootScope, _Auth_, _Authinfo_,
    _Userservice_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();
    Auth = _Auth_;
    Authinfo = _Authinfo_;
    Userservice = _Userservice_;
  }));

  describe('Customer Org Admin', function () {

    var successResponseWithCare = {
      data: {
        id: 'admin-user',
        roles: ['full_admin'],
        entitlements: ['spark', 'cloud-contact-center', 'contact-center-context']
      },
      status: 200
    };
    var successResponseWithoutCare = {
      data: {
        id: 'admin-user',
        roles: ['full_admin'],
        entitlements: ['spark']
      },
      status: 200
    };
    var failedResponse = {
      data: '',
      status: 404
    };

    afterAll(function () {
      successResponseWithCare = successResponseWithoutCare = failedResponse = undefined;
    });

    function initController() {
      $controller('FirstTimeWizardCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }

    function initControllerWith(data) {
      Authinfo.isInDelegatedAdministrationOrg.and.returnValue(data.asDelegatedAdmin);
      Authinfo.getCareServices.and.returnValue(data.careServices);
      Userservice.getUserAsPromise.and.returnValue($q.resolve(data.getUserResponse));
      Userservice.updateUserProfile.and.returnValue($q.resolve(data.updateUserProfileResponse));
      initController();
    }

    beforeEach(function () {
      spyOn(Userservice, 'getUserAsPromise');
      spyOn(Userservice, 'updateUserProfile');
      spyOn(Authinfo, 'isInDelegatedAdministrationOrg');
      spyOn(Authinfo, 'getCareServices');
      spyOn(Authinfo, 'getOrgId').and.returnValue('care-org');
      spyOn(Auth, 'logout').and.stub();
    });

    it('should not get user details if there are no care licenses', function () {
      initControllerWith({
        asDelegatedAdmin: false,
        careServices: []
      });

      expect(Authinfo.getCareServices).toHaveBeenCalled();
      expect(Userservice.getUserAsPromise).not.toHaveBeenCalled();
    });

    it('should not patch user if get user failed', function () {
      initControllerWith({
        asDelegatedAdmin: false,
        careServices: [{
          type: 'CDC_xxx'
        }],
        getUserResponse: failedResponse
      });

      expect(Authinfo.getCareServices).toHaveBeenCalled();
      expect(Userservice.getUserAsPromise).toHaveBeenCalled();
      expect(Userservice.updateUserProfile).not.toHaveBeenCalled();
    });

    it('do not logout if patch user failed', function () {
      initControllerWith({
        asDelegatedAdmin: false,
        careServices: [{
          type: 'CDC_xxx'
        }],
        getUserResponse: successResponseWithoutCare,
        updateUserProfileResponse: failedResponse
      });

      expect(Authinfo.getCareServices).toHaveBeenCalled();
      expect(Userservice.getUserAsPromise).toHaveBeenCalled();
      expect(Userservice.updateUserProfile).toHaveBeenCalled();
      expect(Auth.logout).not.toHaveBeenCalled();
    });

    it('should proceed to patch & logout if care admin does not have care roles & care ' +
      'entitlements',
      function () {
        initControllerWith({
          asDelegatedAdmin: false,
          careServices: [{
            type: 'CDC_xxx'
          }],
          getUserResponse: successResponseWithoutCare,
          updateUserProfileResponse: successResponseWithCare
        });

        expect(Auth.logout).toHaveBeenCalled();
      });

    it('should NOT proceed to patch if care admin does not have syncKms role but has care entitlements',
      function () {
        initControllerWith({
          asDelegatedAdmin: false,
          careServices: [{
            type: 'CDC_xxx'
          }],
          getUserResponse: successResponseWithCare,
          updateUserProfileResponse: successResponseWithCare
        });

        expect(Auth.logout).not.toHaveBeenCalled();
      });
  });
});
