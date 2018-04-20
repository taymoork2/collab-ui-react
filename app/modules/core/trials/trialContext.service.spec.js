'use strict';

var trialModule = require('./trial.module');

describe('Service: Trial Context Service', function () {
  beforeEach(function () {
    this.initModules(trialModule);
    this.injectDependencies(
      '$httpBackend',
      'LogMetricsService',
      'TrialContextService',
      'FeatureToggleService',
      '$q'
    );
    spyOn(this.LogMetricsService, 'logMetrics');
    this.featureToggleSpy = spyOn(this.FeatureToggleService, 'supports');
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
      describe('onboarding feature is enabled', function () {
        beforeEach(function () {
          this.featureToggleSpy.and.returnValue(this.$q.resolve(true));
        });

        it('should add entitlement and onboard context service to a trial and log metrics', function () {
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          var onboardURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard';
          this.$httpBackend.expectPOST(postURL).respond(204);
          this.$httpBackend.expectPOST(onboardURL).respond(201);
          this.TrialContextService.addService(1).then(function (response) {
            expect(response.status).toEqual(201);
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

        it('should fail to onboard context service to a trial but still log metrics', function () {
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          var onboardURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard';
          this.$httpBackend.expectPOST(postURL).respond(204);
          this.$httpBackend.expectPOST(onboardURL).respond(400);
          this.TrialContextService.addService(1).then(function () {
            throw new Error('function:addService should have rejected');
          }).catch(function (response) {
            expect(response.status).toEqual(400);
            expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
          }.bind(this));
          this.$httpBackend.flush();
        });
      });

      describe('onboard feature flag is disabled', function () {
        beforeEach(function () {
          this.featureToggleSpy.and.returnValue(this.$q.resolve(false));
        });
        it('should add context service entitlement to a trial and log metrics', function () {
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          this.$httpBackend.expectPOST(postURL).respond(204);
          this.TrialContextService.addService(1).then(function (response) {
            expect(response.status).toEqual(204);
            expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
          }.bind(this));
          this.$httpBackend.flush();
        });
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
