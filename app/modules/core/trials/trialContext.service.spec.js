'use strict';

var trialModule = require('./trial.module');

describe('Service: Trial Context Service', function () {
  beforeEach(function () {
    this.initModules(trialModule);
    this.injectDependencies(
      '$httpBackend',
      'LogMetricsService',
      'TrialContextService'
    );
    spyOn(this.LogMetricsService, 'logMetrics');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('primary behaviors', function () {
    beforeEach(function () {
      this.TrialContextService.reset();
    });

    describe('function: addService', function () {
      it('should add context service to a trial and log metrics', function () {
        var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
        this.$httpBackend.expectPOST(postURL).respond(204);
        this.TrialContextService.addService(1).then(function (response) {
          expect(response.status).toEqual(204);
          expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
        }.bind(this));
        this.$httpBackend.flush();
      });

      it('should fail to add context service to a trial but still log metrics', function () {
        var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
        this.$httpBackend.expectPOST(postURL).respond(500);
        this.TrialContextService.addService(1).then(function () {
          throw new Error('function:addService should have rejected');
        }).catch(function (response) {
          expect(response.status).toEqual(500);
          expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
        }.bind(this));
        this.$httpBackend.flush();
      });
    });

    describe('function: removeService', function () {
      it('should remove context service from a trial', function () {
        var deleteURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
        this.$httpBackend.expectDELETE(deleteURL).respond(204);
        this.TrialContextService.removeService(1).then(function (response) {
          expect(response.status).toEqual(204);
          expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
        }.bind(this));
        this.$httpBackend.flush();
      });

      it('should fail to remove context service from a trial but still log metrics', function () {
        var deleteURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
        this.$httpBackend.expectDELETE(deleteURL).respond(500);
        this.TrialContextService.removeService(1).then(function () {
          throw new Error('function:removeService should have rejected');
        }).catch(function (response) {
          expect(response.status).toEqual(500);
          expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
        }.bind(this));
        this.$httpBackend.flush();
      });
    });

    describe('function: trialHasService', function () {
      it('should return true if trial has context service enabled', function () {
        var getURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
        this.$httpBackend.expectGET(getURL).respond();
        this.TrialContextService.trialHasService(1).then(function (result) {
          expect(result).toBeTruthy();
        });
        this.$httpBackend.flush();
      });

      it('should return false if trial does not have context service enalbed', function () {
        var getURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
        this.$httpBackend.expectGET(getURL).respond(404, 'not found');
        this.TrialContextService.trialHasService(1).then(function (result) {
          expect(result).toBeFalsy();
        });
        this.$httpBackend.flush();
      });
    });
  });
});
