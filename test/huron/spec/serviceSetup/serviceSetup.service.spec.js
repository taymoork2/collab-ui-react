'use strict';

describe('Service: ServiceSetup', function () {
  var ServiceSetup, $httpBackend, HuronConfig;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Huron'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_ServiceSetup_, _$httpBackend_, _HuronConfig_) {
    ServiceSetup = _ServiceSetup_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('createSite', function () {
    beforeEach(function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/sites').respond(201);
    });

    it('should create site', function () {
      ServiceSetup.createSite();
      $httpBackend.flush();
    });
  });

  describe('listSites', function () {
    var sites = [{
      uuid: '777-888-666',
      steeringDigit: '5',
      siteSteeringDigit: '6'
    }];

    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sites').respond(sites);
    });

    it('should list sites', function () {
      ServiceSetup.listSites();
      $httpBackend.flush();

      expect(angular.equals(ServiceSetup.sites, sites)).toBe(true);
    });
  });

  describe('getSite', function () {
    var site = {
      uuid: '777-888-666',
      steeringDigit: '5',
      siteSteeringDigit: '6'
    };

    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sites/' + site.uuid).respond(site);
    });

    it('should get site', function () {
      ServiceSetup.getSite(site.uuid).then(function (response) {
        expect(angular.equals(response, site)).toBe(true);
      });
      $httpBackend.flush();
    });
  });

  describe('createInternalNumberRange', function () {
    var internalNumberRange = {
      beginNumber: '5000',
      endNumber: '5999'
    };

    beforeEach(function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberranges').respond(201, {}, {
        'location': 'http://some/url/123456'
      });
    });

    it('should create internal number ranges', function () {
      expect(internalNumberRange.uuid).toBeUndefined();

      ServiceSetup.createInternalNumberRange(internalNumberRange);
      $httpBackend.flush();

      expect(internalNumberRange.name).toBeDefined();
      expect(internalNumberRange.description).toBeDefined();
      expect(internalNumberRange.patternUsage).toBeDefined();
      expect(internalNumberRange.uuid).toBeDefined();
    });
  });

  describe('deleteInternalNumberRange', function () {
    var internalNumberRange = {
      uuid: '5550f6e1-c1f5-493f-b9fd-666480cb0adf'
    };

    beforeEach(function () {
      $httpBackend.expectDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberranges/' + internalNumberRange.uuid).respond(204);
    });

    it('should delete the internal number range', function () {
      ServiceSetup.deleteInternalNumberRange(internalNumberRange);
      $httpBackend.flush();
    });
  });

  describe('listInternalNumberRanges', function () {
    var internalNumberRanges = [{
      beginNumber: '5000',
      endNumber: '5999'
    }];

    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberranges').respond(internalNumberRanges);
    });

    it('should get internal number ranges', function () {
      ServiceSetup.listInternalNumberRanges();
      $httpBackend.flush();

      expect(angular.equals(ServiceSetup.internalNumberRanges, internalNumberRanges)).toBe(true);
    });
  });

  describe('getTimeZones', function () {
    beforeEach(function () {
      $httpBackend.expectGET('/app/modules/huron/timeZones.json').respond(getJSONFixture('huron/json/timeZones/timeZones.json'));

      it('should get time zones', function () {
        ServiceSetup.getTimeZones();

        $httpBackend.flush();
      });
    });

  });

});
