'use strict';

var trialModule = require('./trial.module');

describe('Service: Webex Trial Service', function () {
  beforeEach(function () {
    this.initModules(trialModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'Authinfo',
      'TrialWebexService',
      'UrlConfig',
      'WebexOrderStatusResource'
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('org-abc-123');
    spyOn(this.WebexOrderStatusResource, 'get').and.callFake(function (data) {
      var orderStatus = data.trialId === 'trial-ready' ? 'PROVISIONED' : 'PROVISIONING';
      var status = {
        'siteUrl': 'trial-acmecorp.webex.com',
        'timeZoneId': 4,
        'provOrderStatus': orderStatus,
      };
      return {
        '$promise': this.$q.resolve(status),
      };
    }.bind(this));
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('validate site url', function () {
    it('should successfully validate a valid site url', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'true',
          errorCode: '0',
        }],
      });
      this.TrialWebexService.validateSiteUrl('trial-acmecorp.webex.com').then(function (response) {
        expect(response.isValid).toBe(true);
      });
      this.$httpBackend.flush();
    });

    it('should fail to validate an invalid site url', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '434057',
        }],
      });
      this.TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      this.$httpBackend.flush();
    });

    it('should fail to validate a duplicate site url', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '439012',
        }],
      });
      this.TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      this.$httpBackend.flush();
    });

    it('should fail to validate a duplicate or reserved site url', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '431397',
        }],
      });
      this.TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      this.$httpBackend.flush();
    });

    it('should fail to validate a reserved site url', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '439015',
        }],
      });
      this.TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      this.$httpBackend.flush();
    });

    it('should fail to validate a valid site url when errorCode is unknown', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'true',
          errorCode: '2',
        }],
      });
      this.TrialWebexService.validateSiteUrl('trial-acmecorp.webex.com').then(function (response) {
        expect(response.isValid).toBe(false);
      });
      this.$httpBackend.flush();
    });

    it('should reutrn default errorCode when errorCode is unknown', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '1337',
        }],
      });
      this.TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.errorCode).toBe('invalidSite');
      });
      this.$httpBackend.flush();
    });
  });

  describe('get trial status', function () {
    it('should not be pending', function () {
      this.TrialWebexService.getTrialStatus('trial-ready').then(function (data) {
        expect(data.pending).not.toBe(true);
      });
    });

    it('should be pending', function () {
      this.TrialWebexService.getTrialStatus('trial-pending').then(function (data) {
        expect(data.pending).toBe(true);
      });
    });

    it('should have timezoneId', function () {
      this.TrialWebexService.getTrialStatus('trial-ready').then(function (data) {
        expect(data.timeZoneId).toEqual('4');
        expect(typeof data.timeZoneId).toEqual('string');
      });
    });

    it('should have existing trial', function () {
      this.TrialWebexService.getTrialStatus('trial-ready').then(function (data) {
        expect(data.trialExists).toBe(true);
      });
    });
  });
});
