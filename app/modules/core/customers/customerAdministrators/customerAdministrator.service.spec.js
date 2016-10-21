'use strict';

describe('Service: CustomerAdministratorService', function () {
  beforeEach(angular.mock.module('Core'));
  var $httpBackend, Config, CustomerAdministratorService, UserRoleService;
  var customerId;
  var getSalesAdminRegex = /.*%2212345-67890-12345%22\.*/;

  beforeEach(inject(function (_$httpBackend_, _Config_, _CustomerAdministratorService_, _UserRoleService_) {
    $httpBackend = _$httpBackend_;
    Config = _Config_;
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
        .catch(function (response) {
          expect(response).toBe('A Customer Organization Id must be passed');
        });
    });
    it('should verify that a valid ID is passed to removeCustomerAdmin', function () {
      CustomerAdministratorService.removeCustomerAdmin()
        .catch(function (response) {
          expect(response).toBe('A Customer Organization Id must be passed');
        });
    });
  });

  describe('getCustomerAdmins():', function () {
    it('should get assignedSalesAdmins', function () {
      $httpBackend.whenGET(getSalesAdminRegex).respond(function () {
        var data = {
          totalResults: 2
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
        userName: 'fake-userName'
      };
      spyOn(UserRoleService, 'disableFullAdmin');

      CustomerAdministratorService.removeCustomerAdmin(fakeUser, customerId);
      expect(UserRoleService.disableFullAdmin).toHaveBeenCalledWith('fake-userName', customerId);
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
