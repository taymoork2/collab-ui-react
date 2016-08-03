'use strict';

describe('Service: MediaFusionAnalyticsService', function () {
  beforeEach(angular.mock.module('Mediafusion'));

  var $httpBackend, $location, Service, overload, utilization;
  var rootPath = 'https://athena-integration.wbx2.com/athena/api/v1';
  var ping = rootPath + '/ping';

  beforeEach(function () {
    angular.mock.module(function ($provide) {

      utilization = {
        cluster: sinon.stub(),
        host: sinon.stub(),
        hostname: sinon.stub(),
        app: sinon.stub(),
        range: sinon.stub(),
        organization: sinon.stub(),
        time: sinon.stub(),
        day: sinon.stub()

      };
      utilization.cluster.returns("Bangalore-Site1");
      utilization.host.returns("blr-246_cisco_com");
      utilization.hostname.returns("MFA");
      utilization.app.returns("linus");
      utilization.range.returns("24h");
      utilization.organization.returns("2c3c9f9e-73d9-4460-a668-047162ff1bac");
      utilization.time.returns("1458203098");
      utilization.day.returns("2d");

    });
  });

  beforeEach(inject(function ($injector, _MediaFusionAnalyticsService_) {
    Service = _MediaFusionAnalyticsService_;
    $httpBackend = $injector.get('$httpBackend');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingRequest();
  });

  /*afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });*/

  it("Service should be defined", function () {
    expect(Service).toBeDefined();
  });

  it("getCallReject should be defined", function () {
    expect(Service.getCallReject).toBeDefined();
  });

  it("getActiveMediaCount should be defined", function () {
    expect(Service.getActiveMediaCount).toBeDefined();
  });

  it("getClusterAvailability should be defined", function () {
    expect(Service.getClusterAvailability).toBeDefined();
  });

  /*it('should call getActiveMediaCount and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/media_count?startTime=' + utilization.time() + '&endTime=' + utilization.time()).respond(200, {});
    var callback = sinon.stub();

    Service.getActiveMediaCount(utilization.cluster(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();

  });

  it('should call error on callback failure of function getActiveMediaCount ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/media_count?startTime=' + utilization.time() + '&endTime=' + utilization.time()).respond(500, {});
    var callback = sinon.stub();

    Service.getActiveMediaCount(utilization.cluster(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();

  });

  it('should call getCallReject and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + "/call_reject" + '?' + 'startTime=' + utilization.time() + '&' + 'endTime=' + utilization.time()).respond(200);
    var callback = sinon.stub();
    Service.getCallReject(utilization.cluster(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();
  });

  it('should call error on callback failure of function getCallReject ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + "/call_reject" + '?' + 'startTime=' + utilization.time() + '&' + 'endTime=' + utilization.time()).respond(500);
    var callback = sinon.stub();
    Service.getCallReject(utilization.cluster(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();
  });

  it('should call getClusterAvailability and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + "/availability" + '?' + 'startTime=' + utilization.time() + '&' + 'endTime=' + utilization.time()).respond(200);
    var callback = sinon.stub();
    Service.getClusterAvailability(utilization.cluster(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();
  });

  it('should call error on callback failure of function getClusterAvailability ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + "/availability" + '?' + 'startTime=' + utilization.time() + '&' + 'endTime=' + utilization.time()).respond(500);
    var callback = sinon.stub();
    Service.getClusterAvailability(utilization.cluster(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();
  });

  it('should call threshold notification and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/threshold_notification/2d').respond(200);
    var callback = sinon.stub();
    Service.getNotificationForDashboard(function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();
  });

  it('should call error on callback failure of function threshold notification ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/threshold_notification/2d').respond(500);
    var callback = sinon.stub();
    Service.getNotificationForDashboard(function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();
  });

  it('should call getRelativeTimeActiveMediaCount and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/media_count?relativeTime=' + utilization.day()).respond(200, {});
    var callback = sinon.stub();

    Service.getRelativeTimeActiveMediaCount(utilization.cluster(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();

  });

  it('should call error on callback failure of function getRelativeTimeActiveMediaCount ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/media_count?relativeTime=' + utilization.day()).respond(500, {});
    var callback = sinon.stub();

    Service.getRelativeTimeActiveMediaCount(utilization.cluster(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();

  });

  it('should call getRelativeTimeCallReject and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + "/call_reject" + '?' + 'relativeTime=' + utilization.day()).respond(200);
    var callback = sinon.stub();
    Service.getRelativeTimeCallReject(utilization.cluster(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();
  });

  it('should call error on callback failure of function getRelativeTimeCallReject ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + "/call_reject" + '?' + 'relativeTime=' + utilization.day()).respond(500);
    var callback = sinon.stub();
    Service.getRelativeTimeCallReject(utilization.cluster(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();
  });

  it('should call getRelativeTimeClusterAvailability and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + "/availability" + '?' + 'relativeTime=' + utilization.day()).respond(200);
    var callback = sinon.stub();
    Service.getRelativeTimeClusterAvailability(utilization.cluster(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();
  });

  it('should call error on callback failure of function getRelativeTimeClusterAvailability ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + "/availability" + '?' + 'relativeTime=' + utilization.day()).respond(500);
    var callback = sinon.stub();
    Service.getRelativeTimeClusterAvailability(utilization.cluster(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();
  });

  it('should call getRelativeTimeActiveMediaCountForHost and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + '/media_count?relativeTime=' + utilization.day()).respond(200, {});
    var callback = sinon.stub();

    Service.getRelativeTimeActiveMediaCountForHost(utilization.cluster(), utilization.hostname(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();

  });

  it('should call error on callback failure of function getRelativeTimeActiveMediaCountForHost ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + '/media_count?relativeTime=' + utilization.day()).respond(500, {});
    var callback = sinon.stub();

    Service.getRelativeTimeActiveMediaCountForHost(utilization.cluster(), utilization.hostname(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();

  });

  it('should call getRelativeTimeCallRejectForHost and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + "/call_reject" + '?' + 'relativeTime=' + utilization.day()).respond(200);
    var callback = sinon.stub();
    Service.getRelativeTimeCallRejectForHost(utilization.cluster(), utilization.hostname(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();
  });

  it('should call error on callback failure of function getRelativeTimeCallRejectForHost ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + "/call_reject" + '?' + 'relativeTime=' + utilization.day()).respond(500);
    var callback = sinon.stub();
    Service.getRelativeTimeCallRejectForHost(utilization.cluster(), utilization.hostname(), utilization.day(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();
  });

  it('should call getActiveMediaCountForHost and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + '/media_count?startTime=' + utilization.time() + '&endTime=' + utilization.time()).respond(200, {});
    var callback = sinon.stub();

    Service.getActiveMediaCountForHost(utilization.cluster(), utilization.hostname(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();

  });

  it('should call error on callback failure of function getActiveMediaCountForHost ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + '/media_count?startTime=' + utilization.time() + '&endTime=' + utilization.time()).respond(500, {});
    var callback = sinon.stub();

    Service.getActiveMediaCountForHost(utilization.cluster(), utilization.hostname(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();

  });

  it('should call getCallRejectForHost and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + "/call_reject" + '?' + 'startTime=' + utilization.time() + '&' + 'endTime=' + utilization.time()).respond(200);
    var callback = sinon.stub();
    Service.getCallRejectForHost(utilization.cluster(), utilization.hostname(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();
  });

  it('should call error on callback failure of function getCallRejectForHost ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + "/call_reject" + '?' + 'startTime=' + utilization.time() + '&' + 'endTime=' + utilization.time()).respond(500);
    var callback = sinon.stub();
    Service.getCallRejectForHost(utilization.cluster(), utilization.hostname(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();
  });

  it('should call getClusterAvailabilityForHost and return data from the correct backend', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + "/availability" + '?' + 'startTime=' + utilization.time() + '&' + 'endTime=' + utilization.time()).respond(200);
    var callback = sinon.stub();
    Service.getClusterAvailabilityForHost(utilization.cluster(), utilization.hostname(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: true,
        status: 200
      });
    });

    $httpBackend.flush();
  });

  it('should call error on callback failure of function getClusterAvailabilityForHost ', function () {

    $httpBackend
      .when('GET', rootPath + '/organizations/' + null + '/cluster/' + utilization.cluster() + '/host/' + utilization.hostname() + "/availability" + '?' + 'startTime=' + utilization.time() + '&' + 'endTime=' + utilization.time()).respond(500);
    var callback = sinon.stub();
    Service.getClusterAvailabilityForHost(utilization.cluster(), utilization.hostname(), utilization.time(), utilization.time(), function (callback) {
      expect(callback).toEqual({
        success: false,
        status: 500
      });
    });

    $httpBackend.flush();
  });*/

});
