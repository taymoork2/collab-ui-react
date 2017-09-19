
'use strict';

var testModule = require('./index').default;

describe(' hydraService', function () {
  var hydraService, $httpBackend, hydraApplicationUrl, hydraAppId, hydraApplicationResponse;

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(function (_HydraService_, _$httpBackend_, UrlConfig) {
    hydraService = _HydraService_;
    $httpBackend = _$httpBackend_;
    hydraApplicationUrl = UrlConfig.getHydraServiceUrl() + '/applications';
    hydraAppId = 'Y2Y29zcGFyazovL3VzL0FQUExJQ0FUSU9OLzVmM2E0YzZhLTFlM2EtNDk0NS1iZjMxLTdmYTM5Y2UzN2M2Yw';
    hydraApplicationResponse = getJSONFixture('sunlight/json/features/config/hydraTestBotApplicationResponse.json');
  }));

  it('should get hydra application response for a hydraAppId', function () {
    $httpBackend.whenGET(hydraApplicationUrl + '/' + hydraAppId).respond(200, hydraApplicationResponse);
    hydraService.getHydraApplicationDetails(hydraAppId).then(function (response) {
      expect(response.data.botEmail).toBe('care_bot_4f796028-656d-45d8-83e9-94a98174ee49@sparkbot.io');
    });
    $httpBackend.flush();
  });

  it('should get hydra application response of 403 for invalid hydraAppId', function () {
    $httpBackend.whenGET(hydraApplicationUrl + '/' + hydraAppId).respond(403);
    hydraService.getHydraApplicationDetails(hydraAppId).then(function () {}, function (response) {
      expect(response.status).toBe(403);
    });
    $httpBackend.flush();
  });
});
