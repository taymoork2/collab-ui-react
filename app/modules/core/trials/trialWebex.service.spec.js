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
        siteUrl: 'trial-acmecorp.webex.com',
        timeZoneId: 4,
        provOrderStatus: orderStatus,
      };
      return {
        $promise: this.$q.resolve(status),
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

    it('should fail to validate site url even if \'isValid\' is true if \'isExist\' flag is set to true', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'true',
          errorCode: '0',
          isExist: 'true',
        }],
      });
      this.TrialWebexService.validateSiteUrl('trial-acmecorp.webex.com').then(function (response) {
        expect(response.isValid).toBe(false);
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
        expect(response.errorCode).toBe('domainInvalid');
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
        expect(response.errorCode).toBe('duplicateSite');
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
        expect(response.errorCode).toBe('duplicateSite');
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
        expect(response.errorCode).toBe('duplicateSite');
      });
      this.$httpBackend.flush();
    });

    it('should fail to validate with duplicateSite error due to 431205: "Site brand name exists in DNS." error code', function () {
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke').respond({
        properties: [{
          isValid: 'false',
          errorCode: '431205',
        }],
      });
      this.TrialWebexService.validateSiteUrl('acmecorp.com').then(function (response) {
        expect(response.isValid).toBe(false);
        expect(response.errorCode).toBe('duplicateSite');
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

  describe('provision a webex site', function () {
    it('should successfully send WebEx site for provisioning', function () {
      var subscriptionId = 'some-test-id-here';
      var payload = {
        provisionOrder: true,
        serviceOrderUUID: 'some-service-uuid-here',
        webexProvisioningParams: {
          webexSiteDetailsList: [{
            siteUrl: 'somenewsiteurl@webex.com', timezone: '7', centerType: 'MC', quantity: 4,
          }],
          audioPartnerName: 'someaudiopartnerhere@gmail.com',
        },
      };
      var response = { status: 200, message: 'Updated Provisioning parameters' };
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + 'subscriptions/' + subscriptionId + '/provision').respond(response);
      this.TrialWebexService.provisionSubscription(payload, subscriptionId).then(function (response) {
        expect(response.status).toBe(200);
      });
      var payloadHasSendCustomerEmailParam = _.has(payload, 'sendCustomerEmail');
      expect(payloadHasSendCustomerEmailParam).toBe(true);
      this.$httpBackend.flush();
    });

    it('api should return 400 invalid request due to invalid request', function () {
      var subscriptionId = 'some-test-id-here';
      var payload = {
        provisionOrder: true,
        serviceOrderUUID: 'some-service-uuid-here',
        webexProvisioningParams: {
          webexSiteDetailsList: [{
            siteUrl: 'somenewsiteurl@webex.com', timezone: '7', centerType: 'someInvalidCenterTypeHere', quantity: 4,
          }],
          audioPartnerName: 'someaudiopartnerhere@gmail.com',
        },
      };
      this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + 'subscriptions/' + subscriptionId + '/provision').respond(400);
      this.TrialWebexService.provisionSubscription(payload, subscriptionId).then(fail)
        .catch(function (response) {
          expect(response.status).toBe(400);
        });
      this.$httpBackend.flush();
    });
  });
});
