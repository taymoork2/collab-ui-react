'use strict';

describe('Service: CustomerAdministratorService', function () {
  beforeEach(angular.mock.module('Core'));
  var $httpBackend, CustomerAdministratorService;
  var customerId, userUuid;
  var getSalesAdminRegex = /.*\%2212345-67890-12345%22\.*/;
  var userUuidRegex = /.*\/6e6347b4-5acf-4a91-9c50-658b2f5a9f4a\.*/;

  beforeEach(inject(function (_$httpBackend_, _CustomerAdministratorService_) {
    $httpBackend = _$httpBackend_;
    CustomerAdministratorService = _CustomerAdministratorService_;
    customerId = '12345-67890-12345';
    userUuid = '6e6347b4-5acf-4a91-9c50-658b2f5a9f4a';
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('Service must catch illegal parameter passes', function () {
    it('should verify that a valid ID is passed to getAssignedSalesAdministrators', function () {
      CustomerAdministratorService.getAssignedSalesAdministrators()
        .catch(function (response) {
          expect(response).toBe('A Customer Organization Id must be passed');
        });
    });
    it(' should verify that a valid ID is passed to removeCustomerSalesAdmin', function () {
      CustomerAdministratorService.removeCustomerSalesAdmin()
        .catch(function (response) {
          expect(response).toBe('A Customer Organization Id must be passed');
        });
    });
  });

  describe('getAssignedSalesAdministrators', function () {
    it('should get assignedSalesAdmins', function () {
      $httpBackend.whenGET(getSalesAdminRegex).respond(function () {
        var data = {
          totalResults: 2
        };
        return [200, data];
      });
      CustomerAdministratorService.getAssignedSalesAdministrators(customerId).then(function (response) {
        expect(response.data.totalResults).toEqual(2);
      });
      $httpBackend.flush();
    });
  });

  describe('removeCustomerSalesAdmin', function () {
    it('should patch Org data to User', function () {
      $httpBackend.whenPATCH(userUuidRegex).respond([200, {}]);

      CustomerAdministratorService.removeCustomerSalesAdmin(customerId, userUuid).then(function (response) {
        expect(response.status).toEqual(200);
      });
      $httpBackend.flush();
    });
  });
});
