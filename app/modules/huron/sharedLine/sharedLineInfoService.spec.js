'use strict';

describe('Service: SharedLineInfoService', function () {
  var $httpBackend, $rootScope, SharedLineInfoService, HuronConfig;

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('ngResource'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  var dn1 = {
    'uuid': '1'
  };
  var dn2 = {
    'uuid': '2'
  };
  var directoryNumbers = [{
    'directoryNumber': {
      'uuid': '1'
    }
  }, {
    'directoryNumber': {
      'uuid': '2'
    }
  }];

  beforeEach(
    inject(
      function (_$httpBackend_, _$rootScope_, _SharedLineInfoService_, _HuronConfig_) {
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        SharedLineInfoService = _SharedLineInfoService_;
        HuronConfig = _HuronConfig_;
      }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(SharedLineInfoService).toBeDefined();
  });

  describe('addSharedLineUser function', function () {
    it('should exist', function () {
      expect(SharedLineInfoService.addSharedLineUser).toBeDefined();
    });

    it('should add sharedline User', function () {
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/users/a787b84a-3cdf-436c-b1a7-e46e0a0cae11/directorynumbers').respond(201);
      SharedLineInfoService.addSharedLineUser('a787b84a-3cdf-436c-b1a7-e46e0a0cae11', '1').then(function () {});
      $httpBackend.flush();
    });
  });
  describe('loadSharedLineUsers function', function () {
    it('should exist', function () {
      expect(SharedLineInfoService.loadSharedLineUsers).toBeDefined();
    });

    it('should return sharedLineUsers list', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/common/customers/1/users/a787b84a-3cdf-436c-b1a7-e46e0a0cae11').respond(200, getJSONFixture('huron/json/sharedLine/a787b84a-3cdf-436c-b1a7-e46e0a0cae11.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/common/customers/1/users/a787b84a-3cdf-436c-b1a7-e46e0a0cae99').respond(200, getJSONFixture('huron/json/sharedLine/a787b84a-3cdf-436c-b1a7-e46e0a0cae99.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/a787b84a-3cdf-436c-b1a7-e46e0a0cae11/directorynumbers').respond(200, dn1);
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/a787b84a-3cdf-436c-b1a7-e46e0a0cae99/directorynumbers').respond(200, dn2);

      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/directorynumbers/1/users').respond(200, getJSONFixture('huron/json/sharedLine/users.json'));

      SharedLineInfoService.loadSharedLineUsers('1', '2').then(function (data) {
        expect(data.length).toEqual(2);
      });
      $httpBackend.flush();
    });
  });

  describe('getUserLineCount function', function () {
    it('should exist', function () {
      expect(SharedLineInfoService.getUserLineCount).toBeDefined();
    });

    it('should getUserLineCount', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/a787b84a-3cdf-436c-b1a7-e46e0a0cae11/directorynumbers').respond(200, getJSONFixture('huron/json/sharedLine/directoryNumbers.json'));
      SharedLineInfoService.getUserLineCount('a787b84a-3cdf-436c-b1a7-e46e0a0cae11').then(function (data) {
        expect(data).toBe(2);
      });
      $httpBackend.flush();
    });
  });

  describe('getSharedLineUsers function', function () {
    it('should exist', function () {
      expect(SharedLineInfoService.getSharedLineUsers).toBeDefined();
    });
  });

  describe('SharedLineUserDevices function', function () {
    it('loadUserDevices should exist', function () {
      expect(SharedLineInfoService.loadUserDevices).toBeDefined();
    });

    it('setDeviceSharedLine should exist', function () {
      expect(SharedLineInfoService.setDeviceSharedLine).toBeDefined();
    });

    it('setDeviceSharedLine sets sharedline status', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/e787b84a-3cdf-436c-b1a7-e46e0a0ca11/directorynumbers').respond(200, getJSONFixture('huron/json/sharedLine/endpointDn.json'));
      SharedLineInfoService.setDeviceSharedLine('e787b84a-3cdf-436c-b1a7-e46e0a0ca11', '1').then(function (data) {});
      $httpBackend.flush();
    });

    it('loadSharedLineUserDevices should exist', function () {
      expect(SharedLineInfoService.loadSharedLineUserDevices).toBeDefined();
    });

    it('loadSharedLineUserDevices should return sharedLineDevices list', function () {
      var deviceList = [];
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/e787b84a-3cdf-436c-b1a7-e46e0a0ca11').respond(200, getJSONFixture('huron/json/sharedLine/sipendpoint.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/a787b84a-3cdf-436c-b1a7-e46e0a0cae11/endpoints').respond(200, getJSONFixture('huron/json/sharedLine/userendpoint.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/e787b84a-3cdf-436c-b1a7-e46e0a0ca11/directorynumbers').respond(200, getJSONFixture('huron/json/sharedLine/endpointDn.json'));
      SharedLineInfoService.setDeviceSharedLine('e787b84a-3cdf-436c-b1a7-e46e0a0ca11', '1').then(function (data) {
        expect(data.isSharedLine).toBe(true);
      });
      SharedLineInfoService.loadUserDevices('a787b84a-3cdf-436c-b1a7-e46e0a0cae11', '1', deviceList).then(function () {});
      $httpBackend.flush();
    });

    it('getSharedLineDevices should exist', function () {
      expect(SharedLineInfoService.getSharedLineDevices).toBeDefined();
    });
  });

  describe('associateLineEndpoint function', function () {
    it('should exist', function () {
      expect(SharedLineInfoService.associateLineEndpoint).toBeDefined();
    });

    it('should associate line to endpoint', function () {
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/1/directorynumbers').respond(201);
      SharedLineInfoService.associateLineEndpoint('1', '1', '2').then(function () {});
      $httpBackend.flush();
    });
  });

  describe('disassociateLineEndpoint function', function () {
    it('should exist', function () {
      expect(SharedLineInfoService.disassociateLineEndpoint).toBeDefined();
    });

    it('should disassociate endpoint and line', function () {
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/1/directorynumbers/1').respond(204);
      SharedLineInfoService.disassociateLineEndpoint('1', '1', '1');
      $httpBackend.flush();
    });
  });

  describe('disassociateSharedLineUser function', function () {
    it('should exist', function () {
      expect(SharedLineInfoService.disassociateSharedLineUser).toBeDefined();
    });

    it('should disassociate user and line', function () {
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/users/1/directorynumbers/1').respond(204);
      SharedLineInfoService.disassociateSharedLineUser('1', '1', '1');
      $httpBackend.flush();
    });

  });
});
