'use strict';

describe('CallflowService', function () {

  var result = {
    resultsUrl: 'http://sample.org'
  };

  function init() {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies('Notification', 'Log', 'CallflowService', '$httpBackend', 'UrlConfig');
    initDependencySpies.apply(this);
  }

  function initDependencySpies() {
    spyOn(this.Notification, 'notify');
    spyOn(this.Notification, 'error');
    spyOn(this.Log, 'debug');
  }

  beforeEach(init);

  /////////////////////
  it('should have getCallflowCharts defined on the service', function () {
    expect(this.CallflowService.getCallflowCharts).toBeDefined();
  });

  it('should make correct call when isGetCallLogs is false', function () {

    var expectedUrl = this.UrlConfig.getCallflowServiceUrl() +
      'callflow/tool/run' +
      '?orgId=aa&userId=bb' +
      '&logfileFullName=logfilename' +
      '&locusid=locus' +
      '&start_ts=starttime';

    this.$httpBackend.expectGET(expectedUrl).respond(200, result);

    this.CallflowService.getCallflowCharts('aa', 'bb', 'locus', 'starttime', 'logfilename', false)
      .then(function (data) {
        expect(data).toEqual(result);
      })
      .catch(function () {
        expect('promise rejected').toBeFalsy();
      });

    this.$httpBackend.flush();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();

  });

  it('should make correct call when isGetCallLogs is true', function () {

    var expectedUrl = this.UrlConfig.getCallflowServiceUrl() +
      'callflow/logs' +
      '?orgId=aa&userId=bb' +
      '&logfileFullName=logfilename' +
      '&locusid=locus' +
      '&start_ts=starttime';

    this.$httpBackend.expectGET(expectedUrl).respond(200, result);

    this.CallflowService.getCallflowCharts('aa', 'bb', 'locus', 'starttime', 'logfilename', true)
      .then(function (data) {
        expect(data).toEqual(result);
      })
      .catch(function () {
        expect('promise rejected').toBeFalsy();
      });

    this.$httpBackend.flush();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();

  });

  it('should make correct call when locus is "-NA-"', function () {

    var expectedUrl = this.UrlConfig.getCallflowServiceUrl() +
      'callflow/logs' +
      '?orgId=aa&userId=bb' +
      '&logfileFullName=logfilename' +
      '&start_ts=starttime';

    this.$httpBackend.expectGET(expectedUrl).respond(200, result);

    this.CallflowService.getCallflowCharts('aa', 'bb', '-NA-', 'starttime', 'logfilename', true)
      .then(function (data) {
        expect(data).toEqual(result);
      })
      .catch(function () {
        expect('promise rejected').toBeFalsy();
      });

    this.$httpBackend.flush();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();

  });

  it('should make correct call when callStart is "-NA-"', function () {

    var expectedUrl = this.UrlConfig.getCallflowServiceUrl() +
      'callflow/logs' +
      '?orgId=aa&userId=bb' +
      '&logfileFullName=logfilename' +
      '&locusid=locus';

    this.$httpBackend.expectGET(expectedUrl).respond(200, result);

    this.CallflowService.getCallflowCharts('aa', 'bb', 'locus', '-NA-', 'logfilename', true)
      .then(function (data) {
        expect(data).toEqual(result);
      })
      .catch(function () {
        expect('promise rejected').toBeFalsy();
      });

    this.$httpBackend.flush();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();

  });

  it('should reject promise on HTTP error', function () {

    var expectedUrl = this.UrlConfig.getCallflowServiceUrl() +
      'callflow/logs' +
      '?orgId=aa&userId=bb' +
      '&logfileFullName=logfilename' +
      '&locusid=locus';

    this.$httpBackend.expectGET(expectedUrl).respond(503, '');

    var catchCalled = false;
    this.CallflowService.getCallflowCharts('aa', 'bb', 'locus', '-NA-', 'logfilename', true)
      .then(function () {
        expect('promise resolved').toBeFalsy();
      })
      .catch(function (response) {
        expect(response.status).toEqual(503);
        catchCalled = true;
      })
      .finally(function () {
        expect(catchCalled).toBeTruthy();
      });


    this.$httpBackend.flush();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();

  });

});
