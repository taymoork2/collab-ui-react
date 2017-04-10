'use strict';

describe('ReportsService', function () {

  ///////////////////

  function init() {
    this.initModules('Core', 'Huron', 'Sunlight', 'Squared');
    this.injectDependencies('$httpBackend', '$q', 'ReportsService', 'UrlConfig');
  }

  beforeEach(init);

  ///////////////////

  describe("healthMonitor", function () {

    it('should have function defined', function () {
      expect(_.isFunction(this.ReportsService.healthMonitor)).toBeTruthy();
    });

    it('should handle successful http call with object result data', function () {

      this.$httpBackend.expectGET(this.UrlConfig.getHealthCheckServiceUrl())
        .respond(200, { fakeData: true });

      this.ReportsService.healthMonitor(function (data, status) {
        expect(_.isObject(data)).toBeTruthy();
        expect(data.success).toBeTruthy();
        expect(data.fakeData).toBeTruthy();
        expect(status).toEqual(200);
      });

      this.$httpBackend.flush();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();

    });

    it('should handle successful http call but with non-object data', function () {

      this.$httpBackend.expectGET(this.UrlConfig.getHealthCheckServiceUrl())
        .respond(200, 'Not an object');

      this.ReportsService.healthMonitor(function (data, status) {
        expect(_.isObject(data)).toBeTruthy();
        expect(data.success).toBeTruthy();
        expect(status).toEqual(200);
      });

      this.$httpBackend.flush();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();

    });


    it('should handle failed http call', function () {

      this.$httpBackend.expectGET(this.UrlConfig.getHealthCheckServiceUrl())
        .respond(503, 'Service unavailable');

      this.ReportsService.healthMonitor(function (data, status) {
        expect(_.isObject(data)).toBeTruthy();
        expect(data.success).toBeFalsy();
        expect(status).toEqual(503);
      });

      this.$httpBackend.flush();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();

    });

  });

});
