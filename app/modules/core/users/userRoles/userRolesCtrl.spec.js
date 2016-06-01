'use strict';

describe('Controller: UserRolesCtrl', function () {
  var controller, $scope, $stateParams, Authinfo, Orgservice, $controller, Userservice, FeatureToggleService, $q;
  var fakeUserJSONFixture = getJSONFixture('core/json/sipTestFakeUser.json');
  var careUserJSONFixture = getJSONFixture('core/json/users/careTestFakeUser.json');
  var currentUser = fakeUserJSONFixture.fakeUser1;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Squared'));
  beforeEach(module('Ediscovery'));

  beforeEach(inject(function ($rootScope, _$stateParams_, _$controller_, _Authinfo_, _Orgservice_, _Userservice_, _FeatureToggleService_, _$q_) {
    $scope = $rootScope.$new();
    Orgservice = _Orgservice_;
    Userservice = _Userservice_;
    $controller = _$controller_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    $q = _$q_;
    $stateParams = _$stateParams_;
    $stateParams.currentUser = currentUser;

    spyOn(Authinfo, 'getOrgId').and.returnValue('we23f24-4f3f4f-cc7af705-6583-32r3r23r');
    spyOn(Authinfo, 'getUserId').and.returnValue('cc7af705-6583-4f58-b0b6-ea75df64da7e');
    spyOn(Orgservice, 'getOrgCacheOption').and.callFake(function (callback) {
      callback({});
    });
    spyOn(FeatureToggleService, 'supports').and.returnValue({
      then: function () {
        return true;
      }
    });
  }));

  function initController() {
    controller = $controller('UserRolesCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }

  describe('UserRolesCtrl Initialization: ', function () {
    beforeEach(initController);

    it('should initialize the UserRolesCtrl controller', function () {
      expect(controller).toBeDefined();
      expect($scope.currentUser).toEqual($stateParams.currentUser);
    });

    it('should verify the radio button value is populated when controller loads with a currentUser', function () {
      expect($scope.rolesObj.adminRadioValue).toBeDefined();
      expect($scope.rolesObj.adminRadioValue).toEqual(1);
      expect($scope.rolesObj.complianceValue).toBeDefined();
      expect($scope.rolesObj.complianceValue).toBeFalsy();
    });

  });

  describe('Verify Admin Roles Radio input setting: ', function () {
    beforeEach(function () {
      $stateParams.currentUser = fakeUserJSONFixture.fakeUser2;
      initController();
    });

    it('should verify the radio button value is set to 2 when controller loads with a fakeUser2 as currentUser', function () {
      expect($scope.rolesObj.adminRadioValue).toBeDefined();
      expect($scope.rolesObj.adminRadioValue).toEqual(2);
    });
  });

  describe('Setting of user SIP Address: ', function () {
    beforeEach(initController);

    it('should set type cloud-calling and primary SIP Address to $scope.sipAddr', function () {
      expect($scope.sipAddr).toEqual(fakeUserJSONFixture.fakeUser1.sipAddresses[0].value);
    });
  });

  describe('Setting of user SIP Address for another user: ', function () {
    beforeEach(function () {
      $stateParams.currentUser = fakeUserJSONFixture.fakeUser2;
      initController();
    });

    it('should set type cloud-calling SIP Address to $scope.sipAddr', function () {
      expect($scope.sipAddr).toEqual(fakeUserJSONFixture.fakeUser2.sipAddresses[0].value);
    });
  });

  describe('Setting of user SIP Address for another user without an approprate SIP address stored: ', function () {
    beforeEach(function () {
      $stateParams.currentUser = fakeUserJSONFixture.fakeUser3;
      initController();
    });

    it('should set type cloud-calling SIP Address to $scope.sipAddr', function () {
      expect($scope.sipAddr).toEqual('');
    });
  });

  describe('Updating roles for Care user', function () {
    beforeEach(function () {
      $stateParams.currentUser = careUserJSONFixture.fakeUser1;
      initController();
    });

    it('should have spark.synckms role when already present', function () {

      var roles = [
        Object({
          roleName: 'Full_Admin',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'All',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Billing',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Support',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Application',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Reports',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Sales_Admin',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Readonly_Admin',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Help_Desk',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Spark_SyncKms',
          roleState: 'ACTIVE'
        })
      ];

      var mockUser = spyOn(Userservice, 'patchUserRoles');
      $scope.updateRoles();
      expect(mockUser.calls.argsFor(0)[2]).toEqual(roles);
    });
  });

  describe('Updating roles for Care user', function () {
    beforeEach(function () {
      $stateParams.currentUser = careUserJSONFixture.fakeUser2;
      initController();
    });

    it('should not have spark.synckms role when not already present', function () {

      var roles = [
        Object({
          roleName: 'Full_Admin',
          roleState: 'ACTIVE'
        }),
        Object({
          roleName: 'Readonly_Admin',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Sales_Admin',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Billing',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Support',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Reports',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Help_Desk',
          roleState: 'INACTIVE'
        }),
        Object({
          roleName: 'Spark_SyncKms',
          roleState: 'INACTIVE'
        })
      ];

      var mockUser = spyOn(Userservice, 'patchUserRoles');
      $scope.updateRoles();
      expect(mockUser.calls.argsFor(0)[2]).toEqual(roles);
    });
  });
});
