'use strict';

describe('Service: gemService', function () {
  var GmHttpService, $q, $scope, $translate, gemservice, Authinfo;
  var preData = getJSONFixture('gemini/common.json');
  var customerId = 'ff808081527ccb3f0152e39ec555010c';

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));

  afterEach(function () {
    $translate = gemservice = $scope = Authinfo = undefined;
  });
  afterAll(function () {
    preData = customerId = undefined;
  });

  function dependencies(_GmHttpService_, _$q_, _$rootScope_, _$translate_, _gemService_, _Authinfo_) {
    GmHttpService = _GmHttpService_;
    $translate = _$translate_;
    gemservice = _gemService_;
    Authinfo = _Authinfo_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
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
    it('should return json data in getSpData', function () {
      spyOn(GmHttpService, 'httpGet').and.returnValue($q.resolve());

      var servicePartners = preData.common;
      var mockHttpResponse = {
        data: servicePartners,
      };
      servicePartners.content.data.body = preData.servicePartners;
      GmHttpService.httpGet.and.returnValue($q.resolve(mockHttpResponse));

      gemservice.getSpData().then(function (res) {
        expect(res.content.data.body).toBeDefined();
      });
      $scope.$apply();
    });

    it('should return RemedyTicket info in getRemedyTicket', function () {
      spyOn(GmHttpService, 'httpGet').and.returnValue($q.resolve());

      var type = 9;
      var remedyTicket = preData.common;
      remedyTicket.content.data = preData.getRemedyTicket;
      GmHttpService.httpGet.and.returnValue($q.resolve(remedyTicket));

      gemservice.getRemedyTicket(customerId, type).then(function (res) {
        expect(res.content.data.length).toBe(2);
      });
    });
  });

  describe('showError', function () {
    beforeEach(initSpies);
    function initSpies() {
      spyOn($translate, 'instant');
    }

    it('should return errorMessage when error code exist', function () {
      $translate.instant.and.returnValue('Failed to create callback group');
      var error = gemservice.showError('3001');
      expect(error).toBe('Failed to create callback group');
    });

    it('should return genericError when error code does not exist', function () {
      $translate.instant.and.returnValue('gemini.errorCode.900');
      var error = gemservice.showError('900');
      expect(error).toBe('gemini.errorCode.900');
    });
  });
});
