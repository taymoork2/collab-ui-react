/* globals $httpBackend, $q, Authinfo, Config, Notification, WebexOrderStatusResource, TrialWebexService, UrlConfig */
'use strict';

describe('Service: Webex Trial Service', function () {

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(function () {
    bard.inject(this, '$httpBackend', '$q', 'Authinfo', 'Config', 'Notification', 'WebexOrderStatusResource', 'UrlConfig');

    bard.mockService(Authinfo, {
      getOrgId: 'org-abc-123'
    });
    bard.mockService(WebexOrderStatusResource, {
      get: function (data) {
        var orderStatus = data.trialId === 'trial-ready' ? 'PROVISIONED' : 'PROVISIONING';
        var status = {
          'siteUrl': 'trial-acmecorp.webex.com',
          'timeZoneId': 4,
          'provOrderStatus': orderStatus
        };
        return {
          '$promise': $q.when(status)
        };
      }
    });
    bard.mockService(Notification, {
      error: $q.when([])
    });
  });

  beforeEach(function () {
    bard.inject(this, 'TrialWebexService');
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('validate site url', function () {
    it('should successfully validate a valid site url', function () {
      $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'true',
          errorCode: '0'
        }]
      });
      TrialWebexService.validateSiteUrl('trial-acmecorp.webex.com').then(function (response) {
        expect(response.isValid).toBe(true);
      });
      $httpBackend.flush();
    });

    it('should fail to validate an invalid site url', function () {
      $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '434057'
        }]
      });
      TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      $httpBackend.flush();
    });

    it('should fail to validate a duplicate site url', function () {
      $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '439012'
        }]
      });
      TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      $httpBackend.flush();
    });

    it('should fail to validate a duplicate or reserved site url', function () {
      $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '431397'
        }]
      });
      TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      $httpBackend.flush();
    });

    it('should fail to validate a reserved site url', function () {
      $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '439015'
        }]
      });
      TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      $httpBackend.flush();
    });

    it('should fail to validate a valid site url when errorCode is unknown', function () {
      $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'true',
          errorCode: '2'
        }]
      });
      TrialWebexService.validateSiteUrl('trial-acmecorp.webex.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      $httpBackend.flush();
    });

    it('should reutrn default errorCode when errorCode is unknown', function () {
      $httpBackend.whenPOST(UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '1337'
        }]
      });
      TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.errorCode).toBe('invalidSite');
      });
      $httpBackend.flush();
    });
  });

  describe('get trial status', function () {
    it('should not be pending', function () {
      TrialWebexService.getTrialStatus('trial-ready').then(function (data) {
        expect(data.pending).not.toBe(true);
      });
    });

    it('should be pending', function () {
      TrialWebexService.getTrialStatus('trial-pending').then(function (data) {
        expect(data.pending).toBe(true);
      });
    });

    it('should have timezoneId', function () {
      TrialWebexService.getTrialStatus('trial-ready').then(function (data) {
        expect(data.timeZoneId).toEqual('4');
        expect(typeof data.timeZoneId).toEqual('string');
      });
    });

    it('should have existing trial', function () {
      TrialWebexService.getTrialStatus('trial-ready').then(function (data) {
        expect(data.trialExists).toBe(true);
      });
    });
  });
});
