'use strict';

describe('Controller: UserRolesCtrl', function () {
  var controller, $q, $scope, $stateParams, Authinfo, Orgservice, $controller, Userservice, FeatureToggleService;
  var fakeUserJSONFixture = getJSONFixture('core/json/sipTestFakeUser.json');
  var careUserJSONFixture = getJSONFixture('core/json/users/careTestFakeUser.json');
  var currentUser = fakeUserJSONFixture.fakeUser1;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Ediscovery'));

  beforeEach(inject(function ($rootScope, _$q_, _$stateParams_, _$controller_, _Authinfo_, _Orgservice_, _Userservice_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    Orgservice = _Orgservice_;
    Userservice = _Userservice_;
    $controller = _$controller_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
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
    spyOn(Userservice, 'patchUserRoles').and.returnValue($q.resolve());
  }));

  function initController() {
    controller = $controller('UserRolesCtrl', {
      $scope: $scope
    });

    $scope.$apply();
    $scope.rolesEdit = {
      form: {
        displayName: {
          $setValidity: jasmine.createSpy('$setValidity')
        }
      }
    };
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

      $scope.updateRoles();
      expect(Userservice.patchUserRoles.calls.argsFor(0)[2]).toEqual(roles);
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

      $scope.updateRoles();
      expect(Userservice.patchUserRoles.calls.argsFor(0)[2]).toEqual(roles);
    });
  });

  describe('Updating roles for Care user', function () {
    beforeEach(function () {
      $stateParams.currentUser = careUserJSONFixture.fakeUser3;
      initController();
    });

    it('should have orderadmin and helpdesk role when already present', function () {

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
          roleState: 'ACTIVE'
        }),
        Object({
          roleName: 'Order_Admin',
          roleState: 'ACTIVE'
        }),
        Object({
          roleName: 'Spark_SyncKms',
          roleState: 'INACTIVE'
        })
      ];

      $scope.showOrderAdminRole = true;
      $scope.updateRoles();
      expect(Userservice.patchUserRoles.calls.argsFor(0)[2]).toEqual(roles);
    });
  });

  describe('Initialize isPartner from current org response', function () {
    beforeEach(function () {
      expect($scope.isPartner).toBeFalsy();
    });
    afterEach(function () {
      initController();
      expect($scope.isPartner).toBe(true);
    });
    it('should initialize from isPartner', function () {
      Orgservice.getOrgCacheOption.and.callFake(function (callback) {
        callback({
          success: true,
          isPartner: true,
        });
      });
    });
    it('should initialize from delegatedAdministration', function () {
      Orgservice.getOrgCacheOption.and.callFake(function (callback) {
        callback({
          success: true,
          delegatedAdministration: true,
        });
      });
    });
  });

  describe('Verify Admin names: ', function () {
    beforeEach(function () {
      $stateParams.currentUser = fakeUserJSONFixture.fakeUser2;
      initController();
    });

    it('should invalidate display name if first name, last name and doisplay name are all blank', function () {
      $scope.currentUser.name.givenName = '';
      $scope.currentUser.name.familyName = '';
      $scope.currentUser.displayName = '';
      $scope.checkAdminDisplayName();
      expect($scope.rolesEdit.form.displayName.$setValidity).toHaveBeenCalledWith("notblank", false);
    });

    it('should invalidate display name if not first name, last name and doisplay name are all blank', function () {
      $scope.currentUser.displayName = 'DN';
      $scope.checkAdminDisplayName();
      expect($scope.rolesEdit.form.displayName.$setValidity).toHaveBeenCalledWith("notblank", true);
    });
  });

  describe('Verify non-Admin names: ', function () {
    beforeEach(function () {
      $stateParams.currentUser = fakeUserJSONFixture.fakeNonAdminUser;
      initController();
    });

    it('should validate display name if first name, last name and doisplay name are all blank', function () {
      $scope.currentUser.name.givenName = '';
      $scope.currentUser.name.familyName = '';
      $scope.currentUser.displayName = '';
      $scope.checkAdminDisplayName();
      expect($scope.rolesEdit.form.displayName.$setValidity).toHaveBeenCalledWith("notblank", true);
    });
  });

});
