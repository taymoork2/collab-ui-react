'use strict';

describe('FirstTimeWizardCtrl', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  var $controller, $httpBackend, $q, $scope, Auth, Authinfo, Controller, FeatureToggleService, Userservice;

  beforeEach(inject(function (_$controller_, _$httpBackend_, _$q_, $rootScope, _Auth_,
    _Authinfo_, _FeatureToggleService_, _Userservice_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = $rootScope.$new();
    Auth = _Auth_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;
  }));

  describe('Customer Org Admin', function () {

    var adminUser = {
      id: 'admin-user',
      roles: 'full_admin',
      entitlements: ['spark']
    };
    var custOrgId = 'xyz-abc';
    var GetMeUrl = 'https://identity.webex.com/identity/scim/' + custOrgId + '/v1/Users/me';
    var PatchAdminUserUrl = 'https://identity.webex.com/identity/scim/' + custOrgId + '/v1/Users/' + adminUser.id;

    function initController() {
      Controller = $controller('FirstTimeWizardCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }

    function atlasCareTrialsOn(value) {
      FeatureToggleService.atlasCareTrialsGetStatus.and.returnValue($q.when(value));
    }

    function asDelegatedAdmin(isPartner) {
      Authinfo.isInDelegatedAdministrationOrg.and.returnValue(isPartner);
    }

    beforeEach(function () {
      spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus');
      spyOn(Userservice, 'getUser');
      spyOn(Authinfo, 'isInDelegatedAdministrationOrg');
      spyOn(Authinfo, 'getCareServices');
      spyOn(Authinfo, 'getOrgId').and.returnValue(custOrgId);
      spyOn(Auth, 'logout').and.stub();
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not check care feature toggle, if isInDelegatedAdministrationOrg is true', function () {
      asDelegatedAdmin(true);
      initController();
      // We will handle partner scenarios later.
      expect(FeatureToggleService.atlasCareTrialsGetStatus).not.toHaveBeenCalled();
    });

    it('should not get user details if there are no care licenses', function () {
      atlasCareTrialsOn(true);
      asDelegatedAdmin(false);
      Authinfo.getCareServices.and.returnValue([]);
      initController();
      expect(Authinfo.getCareServices).toHaveBeenCalled();
      expect(Userservice.getUser).not.toHaveBeenCalled();
    });

    it('should proceed to patch & logout if care admin does not have care roles & care ' +
      'entitlements',
      function () {
        atlasCareTrialsOn(true);
        asDelegatedAdmin(false);
        Authinfo.getCareServices.and.returnValue([{
          type: 'CDC_xxx'
        }]);
        $httpBackend.expectGET(GetMeUrl).respond(adminUser);
        Userservice.getUser.and.callThrough();
        $httpBackend.expectPATCH(PatchAdminUserUrl).respond(adminUser);

        initController();
        $httpBackend.flush();
        expect(Auth.logout).toHaveBeenCalled();
      });
  });
});
