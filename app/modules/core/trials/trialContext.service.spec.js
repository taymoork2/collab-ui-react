/* globals $q, $httpBackend, TrialContextService, LogMetricsService */
'use strict';

describe('Service: Trial Context Service', function () {

  beforeEach(module('core.trial'));
  beforeEach(module('Core'));

  beforeEach(function () {
    bard.inject(this, '$q', '$httpBackend', '$http', 'Config', 'UrlConfig', 'TrialContextService', 'LogMetricsService');
  });

  describe('primary behaviors', function () {
    beforeEach(function () {
      TrialContextService.reset();
      bard.mockService(LogMetricsService, {});
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('function: addService', function () {
      it('should add context service to a trial and log metrics', function () {
        var postURL = 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/1/services/contactCenterContext';
        $httpBackend.expectPOST(postURL).respond(204);
        TrialContextService.addService(1).then(function (response) {
          expect(response.status).toEqual(204);
          expect(LogMetricsService.logMetrics).toHaveBeenCalled();
        });
        $httpBackend.flush();
      });

      it('should fail to add context service to a trial but still log metrics', function () {
        var postURL = 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/1/services/contactCenterContext';
        $httpBackend.expectPOST(postURL).respond(500);
        TrialContextService.addService(1).then(function () {
          throw new Error('function:addService should have rejected');
        }).catch(function (response) {
          expect(response.status).toEqual(500);
          expect(LogMetricsService.logMetrics).toHaveBeenCalled();
        });
        $httpBackend.flush();
      });
    });

    describe('function: removeService', function () {
      it('should remove context service from a trial', function () {
        var deleteURL = 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/1/services/contactCenterContext';
        $httpBackend.expectDELETE(deleteURL).respond(204);
        TrialContextService.removeService(1).then(function (response) {
          expect(response.status).toEqual(204);
          expect(LogMetricsService.logMetrics).toHaveBeenCalled();
        });
        $httpBackend.flush();
      });

      it('should fail to remove context service from a trial but still log metrics', function () {
        var deleteURL = 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/1/services/contactCenterContext';
        $httpBackend.expectDELETE(deleteURL).respond(500);
        TrialContextService.removeService(1).then(function () {
          throw new Error('function:removeService should have rejected');
        }).catch(function (response) {
          expect(response.status).toEqual(500);
          expect(LogMetricsService.logMetrics).toHaveBeenCalled();
        });
        $httpBackend.flush();
      });
    });

    describe('function: trialHasService', function () {
      it('should return true if trial has context service enabled', function () {
        var getURL = 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/1/services/contactCenterContext';
        $httpBackend.expectGET(getURL).respond();
        TrialContextService.trialHasService(1).then(function (result) {
          expect(result).toBeTruthy();
        });
        $httpBackend.flush();
      });

      it('should return false if trial does not have context service enalbed', function () {
        var getURL = 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/1/services/contactCenterContext';
        $httpBackend.expectGET(getURL).respond(404, 'not found');
        TrialContextService.trialHasService(1).then(function (result) {
          expect(result).toBeFalsy();
        });
        $httpBackend.flush();
      });
    });
  });
});
