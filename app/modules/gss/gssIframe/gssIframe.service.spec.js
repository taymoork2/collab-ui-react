'use strict';

describe('Service: GSSIframeService', function () {
  var $httpBackend, GSSIframeService;

  beforeEach(angular.mock.module('GSS'));
  beforeEach(inject(dependencies));

  afterEach(function () {
    $httpBackend = GSSIframeService = undefined;
  });

  function dependencies(_$httpBackend_, _GSSIframeService_) {
    $httpBackend = _$httpBackend_;
    GSSIframeService = _GSSIframeService_;
  }

  it('compare version', function () {
    $httpBackend.expectGET(/.*\/compareVersion.*/g).respond(200, true);
    GSSIframeService.syncCheck()
      .then(function (res) {
        expect(res).toBeTruthy();
      });
    $httpBackend.flush();
  });

  it('sync up the data with AWS', function () {
    $httpBackend.expectPOST(/.*\/syncUpFromAWS.*/g).respond(200, true);
    GSSIframeService.syncUp()
      .then(function (res) {
        expect(res).toBeTruthy();
      });
    $httpBackend.flush();
  });
});
