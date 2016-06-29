/* globals $q, $httpBackend, TrialContextService */
'use strict';

describe('Service: Trial Context Service', function () {

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(function () {
    bard.inject(this, '$q', '$httpBackend', '$http', 'Config', 'UrlConfig', 'TrialContextService');
  });

  describe('primary behaviors', function () {
    beforeEach(function () {
      TrialContextService.reset();
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should add context service to a trial', function () {
      var postURL = 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/1/services/contactCenterContext';
      $httpBackend.expectPOST(postURL).respond({});
      TrialContextService.addService(1);
      $httpBackend.flush();
    });

    it('should remove context service from a trial', function () {
      var deleteURL = 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/1/services/contactCenterContext';
      $httpBackend.expectDELETE(deleteURL).respond({});
      TrialContextService.removeService(1);
      $httpBackend.flush();
    });

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
