'use strict';

describe('Service: CustomerAdministratorService', function () {
  beforeEach(angular.mock.module('Core'));
  var $httpBackend, $rootScope, Config, Authinfo, CustomerAdministratorService, UserRoleService;
  var customerId;
  var getSalesAdminRegex = /.*%2212345-67890-12345%22\.*/;

  afterAll(function () {
    getSalesAdminRegex = undefined;
  });

  afterEach(function () {
    $httpBackend = $rootScope = Config = Authinfo = CustomerAdministratorService = UserRoleService = customerId = undefined;
  });

  beforeEach(inject(function (_$rootScope_, _$httpBackend_, _Config_, _Authinfo_, _CustomerAdministratorService_, _UserRoleService_) {
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    Config = _Config_;
    Authinfo = _Authinfo_;
    CustomerAdministratorService = _CustomerAdministratorService_;
    UserRoleService = _UserRoleService_;
    customerId = '12345-67890-12345';
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('Service must catch illegal parameter passes', function () {
    it('should verify that a valid ID is passed to getCustomerAdmins', function () {
      CustomerAdministratorService.getCustomerAdmins()
        .then(fail)
        .catch(function (response) {
          expect(response).toBe('A Customer Organization Id must be passed');
        });
    });

    it('should verify that a valid ID is passed to removeCustomerAdmin', function () {
      CustomerAdministratorService.removeCustomerAdmin()
        .then(fail)
        .catch(function (response) {
          expect(response).toBe('A Customer Organization Id must be passed');
        });
    });
  });

  describe('addCustomerAdmin()', function () {
    var user = {
      userName: 'tester',
    };

    it('should reject if customerOrgId is invalid', function () {
      var rejectCalled = false;
      CustomerAdministratorService.addCustomerAdmin(user, null)
        .then(fail)
        .catch(function () {
          rejectCalled = true;
          expect('reject called').toBeTruthy();
        })
        .finally(function () {
          expect(rejectCalled).toBeTruthy();
        });
      $rootScope.$digest();
    });

    it('should reject when user is invalid', function () {
      var rejectCalled = false;
      CustomerAdministratorService.addCustomerAdmin(null, 'aabbccdd')
        .then(fail)
        .catch(function () {
          rejectCalled = true;
          expect('reject called').toBeTruthy();
        })
        .finally(function () {
          expect(rejectCalled).toBeTruthy();
        });
      $rootScope.$digest();
    });

    it('should succeed with valid data', function () {
      var user = {
        userName: 'test user',
        roles: [],
      };

      spyOn(Authinfo, 'getOrgId').and.returnValue('abcdefg');

      $httpBackend.when('PATCH', /organization\/abcdefg\/users\/roles/)
        .respond(200, {});

      var rejectCalled = false;
      CustomerAdministratorService.addCustomerAdmin(user, 'aabbccdd')
        .catch(function () {
          rejectCalled = true;
          expect('reject called').toBeFalsey();
        })
        .finally(function () {
          expect(rejectCalled).toBeFalsy();
        });

      $httpBackend.flush();
    });
  });

  describe('getCustomerAdmins():', function () {
    it('should get assignedSalesAdmins', function () {
      $httpBackend.whenGET(getSalesAdminRegex).respond(function () {
        var data = {
          totalResults: 2,
        };
        return [200, data];
      });
      CustomerAdministratorService.getCustomerAdmins(customerId).then(function (response) {
        expect(response.data.totalResults).toEqual(2);
      });
      $httpBackend.flush();
    });
  });

  describe('removeCustomerAdmin():', function () {
    it('should call through to "UserRoleService.disableFullAdmin()"', function () {
      var fakeUser = {
        userName: 'fake-userName',
      };
      spyOn(UserRoleService, 'disableFullAdmin');

      CustomerAdministratorService.removeCustomerAdmin(fakeUser, customerId);
      expect(UserRoleService.disableFullAdmin).toHaveBeenCalledWith('fake-userName', customerId);
    });

    it('should reject promise when passed invalid customerId', function () {
      var fakeUser = {
        userName: 'fake-userName',
      };
      spyOn(UserRoleService, 'disableFullAdmin');

      var rejectCalled = false;
      CustomerAdministratorService.removeCustomerAdmin(fakeUser, null)
        .then(fail)
        .catch(function () {
          rejectCalled = true;
        })
        .finally(function () {
          expect(rejectCalled).toBeTruthy();
        });
      $rootScope.$digest();
      expect(UserRoleService.disableFullAdmin).not.toHaveBeenCalledWith('fake-userName', customerId);
    });
  });

  describe('needsSalesAdminRoleForPartnerOrg():', function () {
    it('should look in the "roles" property for either a full admin or sales admin role, and return true if neither are found', function () {
      var fakeUser = {};
      fakeUser.roles = [];
      expect(CustomerAdministratorService._helpers.needsSalesAdminRoleForPartnerOrg(fakeUser)).toBe(true);

      fakeUser.roles = [Config.backend_roles.full_admin];
      expect(CustomerAdministratorService._helpers.needsSalesAdminRoleForPartnerOrg(fakeUser)).toBe(false);

      fakeUser.roles = [Config.backend_roles.sales];
      expect(CustomerAdministratorService._helpers.needsSalesAdminRoleForPartnerOrg(fakeUser)).toBe(false);
    });
  });
});
