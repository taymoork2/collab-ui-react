'use strict';

describe('Service: ServiceSetup', function () {
  var ServiceSetup, $httpBackend, HuronConfig, FeatureToggleService, $q;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };

  beforeEach(angular.mock.module('Huron'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));


  beforeEach(inject(function (_ServiceSetup_, _$httpBackend_, _HuronConfig_, _FeatureToggleService_, _$q_) {
    $q = _$q_;
    ServiceSetup = _ServiceSetup_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    FeatureToggleService = _FeatureToggleService_;
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
      siteSteeringDigit: '6',
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
      uuid: '1234567890',
      steeringDigit: '5',
      siteSteeringDigit: '6',
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

  describe('loadExternalNumberPool', function () {
    var extNumPool = [{
      uuid: '777-888-666',
      pattern: '+11234567890',
    }];

    beforeEach(function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?directorynumber=&externalnumbertype=Fixed+Line+or+Mobile&order=pattern').respond(extNumPool);
    });

    it('should list external number pool', function () {
      ServiceSetup.loadExternalNumberPool();
      $httpBackend.flush();
      expect(ServiceSetup.externalNumberPool).toEqual(extNumPool);
      expect(angular.equals(ServiceSetup.externalNumberPool, extNumPool)).toBe(true);
    });
  });

  describe('updateCustomer', function () {
    var customer = [{
      uuid: '1234567890',
      voicemail: {
        pilotNumber: '+11234567890',
      },
    }];

    beforeEach(function () {
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/common/customers/1').respond(201);
    });

    it('should save customer', function () {
      ServiceSetup.updateCustomer(customer);
      $httpBackend.flush();
    });
  });

  describe('updateVoicemailTimezone', function () {
    var usertemplate = [{
      timeZoneName: 'America/Chicago',
      objectId: 'fd87d99c-98a4-45db-af59-ebb9a6f18fdd',
    }];
    beforeEach(function () {
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/voicemail/customers/1/usertemplates').respond(204);
    });

    it('should update timezone', function () {
      ServiceSetup.updateVoicemailTimezone(usertemplate.timeZoneName, usertemplate.objectId);
      $httpBackend.flush();
    });
  });

  describe('listVoicemailTimezone', function () {
    var usertemplate = [{
      timeZoneName: 'America/Chicago',
      objectId: 'fd87d99c-98a4-45db-af59-ebb9a6f18fdd',
    }];
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voicemail/customers/1/usertemplates?query=(alias+startswith+1)').respond(usertemplate);
    });

    it('should update timezone', function () {
      ServiceSetup.listVoicemailTimezone().then(function (response) {
        expect(angular.equals(response, usertemplate)).toBe(true);
      });
      $httpBackend.flush();
    });
  });

  describe('getVoicemailPilotNumber', function () {
    var voicemail = {
      pilotNumber: '+1234567890',
      uuid: '1234567890',
    };

    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voicemail/customers/1').respond(voicemail);
    });

    it('should get voicemail pilot number', function () {
      ServiceSetup.getVoicemailPilotNumber().then(function (response) {
        expect(angular.equals(response, voicemail)).toBe(true);
      });
      $httpBackend.flush();
    });
  });

  describe('getDateFormats', function () {
    it('should get the Date formats', function () {
      ServiceSetup.getDateFormats().then(function (response) {
        expect(response).toBeDefined();
        expect(response.length).toBe(9);
      });
    });
  });

  describe('getTimeFormats', function () {
    it('should get the Time formats', function () {
      ServiceSetup.getTimeFormats().then(function (response) {
        expect(response).toBeDefined();
        expect(response.length).toBe(2);
      });
    });
  });

  describe('getTimeZones', function () {
    it('should get time zones', function () {
      ServiceSetup.getTimeZones().then(function (response) {
        expect(response).toBeDefined();
        expect(response.length).toBe(430);
      });
    });
  });

  describe('getSiteLanguages', function () {
    it('should get site default languages & additional languages since userlocale2 feature toggle was enabled', function () {
      ServiceSetup.getSiteLanguages().then(function (response) {
        expect(response).toBeDefined();
        expect(response.length).toBe(12);
        var filteredLanguage = _.find(response, { value: 'es_ES' });
        expect(filteredLanguage).toBeDefined();
        var translatedLanguages = ServiceSetup.getTranslatedSiteLanguages(response);
        expect(translatedLanguages).toBeDefined();
        expect(translatedLanguages.length).toBe(12);
      });
    });
  });

  describe('getSiteCountries', function () {
    it('should get site countries', function () {
      FeatureToggleService.supports = jasmine.createSpy().and.returnValue($q.resolve(true));
      ServiceSetup.getSiteCountries().then(function (response) {
        expect(response).toBeDefined();
        expect(response.length).toBe(16);
        var translatedCountries = ServiceSetup.getTranslatedSiteCountries(response);
        expect(translatedCountries).toBeDefined();
        expect(translatedCountries.length).toBe(16);
      });
    });
  });

  describe('generateVoiceMailNumber', function () {
    var customerId = 'c127f0cb-8abf-4965-a013-ce41a0649b7e';
    var countrycode = '+91';
    var expectedVoiceMailPilot = '+911201020715001211081011150409060510000';
    it('should generate generateVoiceMailNumber', function () {
      var genNumber = ServiceSetup.generateVoiceMailNumber(customerId, countrycode);
      expect(genNumber).toEqual(expectedVoiceMailPilot);
      expect(genNumber.length).toEqual(40);
    });
  });
});
