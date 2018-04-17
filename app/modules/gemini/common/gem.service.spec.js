'use strict';

describe('Service: gemService', function () {
  var $httpBackend, $translate, gemservice, UrlConfig, Authinfo;
  var customerId = 'ff808081527ccb3f0152e39ec555010c';
  var ccaDomainId = 'ff808081527ccb3f0152e39ec555010c';

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));

  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
  });

  afterEach(function () {
    $httpBackend = $translate = gemservice = UrlConfig = Authinfo = undefined;
  });
  afterAll(function () {
    customerId = undefined;
  });

  function dependencies(_$httpBackend_, _$translate_, _gemService_, _Authinfo_, _UrlConfig_) {
    $httpBackend = _$httpBackend_;
    $translate = _$translate_;
    gemservice = _gemService_;
    UrlConfig = _UrlConfig_;
    Authinfo = _Authinfo_;
  }

  it('should return true in isAvops', function () {
    spyOn(Authinfo, 'getRoles').and.returnValue('["User", "Full_Admin"]');
    var returnVal = gemservice.isAvops();
    expect(returnVal).toBe(true);
  });

  it('should return true in isServicePartner', function () {
    spyOn(Authinfo, 'getRoles').and.returnValue('["PARTNER_USER", "PARTNER_ADMIN"]');
    var returnVal = gemservice.isServicePartner();
    expect(returnVal).toBe(true);
  });

  describe('http request', function () {
    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return json data in getSpData', function () {
      var countries = this.preData.getCountries;
      var getCountriesUrl = UrlConfig.getGeminiUrl() + 'countries';
      $httpBackend.expectGET(getCountriesUrl).respond(200, countries);

      var servicePartners = this.preData.servicePartners;
      $httpBackend.expectGET(/.*\/servicepartner.*/g).respond(200, servicePartners);

      gemservice.getSpData().then(function (res) {
        expect(res).toBeDefined();
      });
      $httpBackend.flush();
    });

    it('should return RemedyTicket info in getRemedyTicket', function () {
      var countries = this.preData.getCountries;
      var getCountriesUrl = UrlConfig.getGeminiUrl() + 'countries';
      $httpBackend.expectGET(getCountriesUrl).respond(200, countries);

      var type = 9;
      var remedyTicket = this.preData.getRemedyTicket;
      var remedyTicketUrl = UrlConfig.getGeminiUrl() + 'customers/' + customerId + '/type/' + type + '/entities/' + ccaDomainId + '/remedy-ticket';

      $httpBackend.expectGET(remedyTicketUrl).respond(200, remedyTicket);
      gemservice.getRemedyTicket(customerId, ccaDomainId, type).then(function (res) {
        expect(res.length).toBe(2);
      });
      $httpBackend.flush();
    });
  });

  describe('showError', function () {
    beforeEach(initSpies);
    function initSpies() {
      spyOn($translate, 'instant');
    }

    it('should return genericError if error code not exist', function () {
      $translate.instant.and.returnValue('Failed to create callback group');
      var error = gemservice.showError('3001');
      expect(error).toBe('Failed to create callback group');
    });

    it('should return genericError if error code not exist', function () {
      $translate.instant.and.returnValue('An unexpected error occurred. Please try again later.');
      var error = gemservice.showError('3011');
      expect(error).toBe('An unexpected error occurred. Please try again later.');
    });
  });
});
