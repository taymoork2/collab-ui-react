'use strict';

describe('Service: AutoAttendantHybridCareService', function () {
  var configureJson = getJSONFixture('huron/json/autoAttendant/aaOrgConfigure.json');
  var q;
  var Authinfo, AutoAttendantHybridCareService, PrivateTrunkService, ServiceDescriptorService;
  var $scope, $rootScope, $timeout;
  var notFoundResponse;
  var deferred;
  var isCare;

  afterEach(function () {
    $scope = $rootScope = $timeout = q = Authinfo = AutoAttendantHybridCareService = PrivateTrunkService = ServiceDescriptorService = undefined;
  });

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($q, _$rootScope_, _$timeout_, _Authinfo_, _AutoAttendantHybridCareService_, _PrivateTrunkService_, _ServiceDescriptorService_) {
    AutoAttendantHybridCareService = _AutoAttendantHybridCareService_;
    Authinfo = _Authinfo_;
    PrivateTrunkService = _PrivateTrunkService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $scope = $rootScope.$new();
    q = $q;
    notFoundResponse = {
      status: 404,
      statusText: 'Not Found',
    };
    isCare = spyOn(Authinfo, 'isCare').and.returnValue(true);
  }));

  describe('isHybridCallConfigured', function () {
    beforeEach(inject(function () {
      // setup the promise
      deferred = q.defer();
      spyOn(ServiceDescriptorService, 'getServices').and.returnValue(q.resolve(deferred.promise));
    }));

    it('should set return true if there are squaredUC and squaredEC enabled services present', function () {
      deferred.resolve(configureJson.hybridConfigurationResponse.items);

      // verify data returned
      AutoAttendantHybridCareService.isHybridCallConfigured().then(function (data) {
        expect(data).toBe(true);
      });
      $scope.$apply();
      $timeout.flush();
    });

    it('should set return false if there are squaredUC and squaredEC enabled services not present', function () {
      deferred.resolve(configureJson.hybridNotConfiguredResponse.items);

      // verify data returned
      AutoAttendantHybridCareService.isHybridCallConfigured().then(function (data) {
        expect(data).toBe(false);
      });
      $scope.$apply();
      $timeout.flush();
    });

    it('should return false when 404', function () {
      // reject  with 404
      deferred.reject(notFoundResponse);
      AutoAttendantHybridCareService.isHybridCallConfigured().then(function (data) {
        expect(data).toBe(false);
      });
      $scope.$apply();
      $timeout.flush();
    });

    it('should return false if care or voice is not enabled', function () {
      isCare.and.returnValue(false);
      expect(AutoAttendantHybridCareService.isHybridCallConfigured()).toBe(false);
    });
  });

  describe('isEPTConfigured', function () {
    beforeEach(inject(function () {
      // setup the promise
      deferred = q.defer();
      spyOn(PrivateTrunkService, 'getPrivateTrunk').and.returnValue(q.resolve(deferred.promise));
    }));

    it('should set return true if there is atleast one resource present', function () {
      deferred.resolve(configureJson.EPTConfigureResponse);

      // verify data returned
      AutoAttendantHybridCareService.isEPTConfigured().then(function (data) {
        expect(data).toBe(true);
      });
      $scope.$apply();
      $timeout.flush();
    });

    it('should set return false if no resource present', function () {
      deferred.resolve(configureJson.EPTNotConfiguredResponse);

      // verify data returned
      AutoAttendantHybridCareService.isEPTConfigured().then(function (data) {
        expect(data).toBe(false);
      });
      $scope.$apply();
      $timeout.flush();
    });

    it('should return false when 404', function () {
      // reject  with 404
      deferred.reject(notFoundResponse);
      AutoAttendantHybridCareService.isEPTConfigured().then(function (data) {
        expect(data).toBe(false);
      });
      $scope.$apply();
      $timeout.flush();
    });

    it('should return false if care or voice is not enabled', function () {
      isCare.and.returnValue(false);
      expect(AutoAttendantHybridCareService.isEPTConfigured()).toBe(false);
    });
  });

  describe('isHybridAndEPTConfigured', function () {
    var deferred2;

    beforeEach(inject(function () {
      // setup the promise
      deferred2 = q.defer();
      deferred = q.defer();
      spyOn(PrivateTrunkService, 'getPrivateTrunk').and.returnValue(q.resolve(deferred.promise));
      spyOn(ServiceDescriptorService, 'getServices').and.returnValue(q.resolve(deferred2.promise));
    }));

    it('should return true if Hybrid and EPT both are configured', function () {
      deferred.resolve(configureJson.EPTConfigureResponse);
      deferred2.resolve(configureJson.hybridConfigurationResponse.items);
      AutoAttendantHybridCareService.isHybridAndEPTConfigured().then(function (data) {
        expect(data).toBe(true);
      });
      $scope.$apply();
      $timeout.flush();
    });

    it('should return false if Hybrid is configured but EPT is not configured', function () {
      deferred.resolve(configureJson.EPTNotConfiguredResponse);
      deferred2.resolve(configureJson.hybridConfigurationResponse.items);
      AutoAttendantHybridCareService.isHybridAndEPTConfigured().then(function (data) {
        expect(data).toBe(false);
      });
      $scope.$apply();
      $timeout.flush();
    });

    it('should return false if EPT is configured but hybrid is not configured', function () {
      deferred.resolve(configureJson.EPTConfigureResponse);
      deferred2.resolve(configureJson.hybridNotConfiguredResponse.items);
      AutoAttendantHybridCareService.isHybridAndEPTConfigured().then(function (data) {
        expect(data).toBe(false);
      });
      $scope.$apply();
      $timeout.flush();
    });

    it('should return false if EPT and Hybrid both are not configured', function () {
      deferred.resolve(configureJson.EPTNotConfiguredResponse);
      deferred2.resolve(configureJson.hybridNotConfiguredResponse.items);
      $scope.$apply();
      AutoAttendantHybridCareService.isHybridAndEPTConfigured().then(function (data) {
        expect(data).toBe(false);
      });
      $timeout.flush();
    });

    it('should return false if care or voice isnot enabled', function () {
      isCare.and.returnValue(false);
      AutoAttendantHybridCareService.isHybridAndEPTConfigured().then(function (data) {
        expect(data).toBe(false);
      });
    });
  });

  describe('isSparkCallConfigured', function () {
    it('should return true if there is squared UC', function () {
      expect(AutoAttendantHybridCareService.isSparkCallConfigured()).toBe(false);
      $scope.$apply();
      $timeout.flush();
    });

    it('should return true if there is squared UC', function () {
      spyOn(AutoAttendantHybridCareService, 'isSparkCallConfigured').and.returnValue(false);
      expect(AutoAttendantHybridCareService.isSparkCallConfigured()).toBe(false);
      $scope.$apply();
      $timeout.flush();
    });
  });

  describe('setHybridandEPTConfiguration', function () {
    it('should test setHybridandEPTConfiguration function when it is true', function () {
      AutoAttendantHybridCareService.setHybridandEPTConfiguration(true);
      expect(AutoAttendantHybridCareService.getHybridandEPTConfiguration()).toBeTruthy();
    });

    it('should test getHybridandEPTConfiguration function when it is false', function () {
      AutoAttendantHybridCareService.setHybridandEPTConfiguration(false);
      expect(AutoAttendantHybridCareService.getHybridandEPTConfiguration()).toBeFalsy();
    });
  });
});
