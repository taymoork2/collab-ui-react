'use strict';

//This commit is just for demo needed.
xdescribe('HealthService', function () {
  beforeEach(angular.mock.module('Core'));

  var $httpBackend, QlikService;

  var regex = /.*\/siteUrl\.*/;

  afterEach(function () {
    $httpBackend = QlikService = undefined;
  });

  afterAll(function () {
    regex = undefined;
  });

  beforeEach(inject(function (_$httpBackend_, _QlikService_) {
    $httpBackend = _$httpBackend_;
    QlikService = _QlikService_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('WebEx Metrics Status for server', function () {
    beforeEach(installPromiseMatchers);

    it('should return qlik url with ticket if site is available', function () {
      $httpBackend.expect('GET', regex).respond({
        data: 'https://ds2-win2012-01/?ticket=abctest',
      });

      var siteUrl = 'TimTrinhTrialInt150.WebEx.com';
      var promise = QlikService.getMetricsLink('webex', siteUrl);

      $httpBackend.flush();
      expect(promise.$$state.value).toContain('ds2-win2012');
    });

    it('should return an error if site or token is unavailable', function () {
      $httpBackend.expect('GET', regex).respond(404);

      var siteUrl = 'TimTrinhTrialInt150.WebEx.com';
      var promise = QlikService.getWebExMetricsLink(siteUrl);

      $httpBackend.flush();
      expect(promise).toBeRejected();
    });
  });

});
