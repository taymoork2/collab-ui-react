'use strict';

var trialModule = require('./trial.module');

describe('Service: Trial Context Service', function () {
  beforeEach(function () {
    this.initModules(trialModule);
    this.injectDependencies(
      '$httpBackend',
      'LogMetricsService',
      'TrialContextService',
      'Authinfo',
      '$q'
    );
    spyOn(this.LogMetricsService, 'logMetrics');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('9');
    spyOn(this.Authinfo, 'getUserId').and.returnValue('partnerFullAdmin');
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
      describe('New Trial', function () {
        it('should add entitlement and onboard context service to a trial and log metrics', function () {
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          var onboardPostURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard';
          this.$httpBackend.expectPOST(postURL).respond(204);
          this.$httpBackend.expectPOST(onboardPostURL).respond(201);
          this.TrialContextService.addService('1', true).then(function (response) {
            expect(response.status).toEqual(201);
            expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
          }.bind(this));
          this.$httpBackend.flush();
        });

        it('should fail to add context service to a trial but still log metrics', function () {
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          this.$httpBackend.expectPOST(postURL).respond(500);
          this.TrialContextService.addService('1', true).then(function () {
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
          this.TrialContextService.addService('1', true).then(function () {
            throw new Error('function:addService should have rejected');
          }).catch(function (response) {
            expect(response.status).toEqual(400);
            expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
          }.bind(this));
          this.$httpBackend.flush();
        });
      });

      describe('Edit Trial', function () {
        it('add the customer org to managedOrgList for Partner Full Admin, add entitlement, onboard context service, and also log metrics', function () {
          spyOn(this.Authinfo, 'getManagedOrgs').and.returnValue([]);
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          var onboardPostURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard';
          var onboardGetURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard/1';
          var adminPatchURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/9/users/partnerFullAdmin/actions/configureCustomerAdmin/invoke?customerOrgId=1';
          this.$httpBackend.expectPOST(adminPatchURL).respond(204);
          this.$httpBackend.expectPOST(postURL).respond(204);
          this.$httpBackend.expectGET(onboardGetURL).respond(404);
          this.$httpBackend.expectPOST(onboardPostURL).respond(201);
          this.TrialContextService.addService('1', false).then(function (response) {
            expect(response.status).toEqual(201);
            expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
          }.bind(this));
          this.$httpBackend.flush();
        });

        it('should add the customer org to managedOrgList for Partner Full Admin, add entitlement, and also log metrics', function () {
          spyOn(this.Authinfo, 'getManagedOrgs').and.returnValue([]);
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          var onboardGetURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard/1';
          var adminPatchURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/9/users/partnerFullAdmin/actions/configureCustomerAdmin/invoke?customerOrgId=1';
          this.$httpBackend.expectPOST(adminPatchURL).respond(204);
          this.$httpBackend.expectPOST(postURL).respond(204);
          this.$httpBackend.expectGET(onboardGetURL).respond(200);
          this.TrialContextService.addService('1', false).then(function (response) {
            expect(response.status).toEqual(200);
            expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
          }.bind(this));
          this.$httpBackend.flush();
        });

        it('should add the customer org to managedOrgList for Partner Full Admin, add entitlement, but failed on Get Onboard. Still log metrics', function () {
          spyOn(this.Authinfo, 'getManagedOrgs').and.returnValue([]);
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          var onboardGetURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard/1';
          var adminPatchURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/9/users/partnerFullAdmin/actions/configureCustomerAdmin/invoke?customerOrgId=1';
          this.$httpBackend.expectPOST(adminPatchURL).respond(204);
          this.$httpBackend.expectPOST(postURL).respond(204);
          this.$httpBackend.expectGET(onboardGetURL).respond(400);
          this.TrialContextService.addService('1', false).then(function (response) {
            expect(response.status).toEqual(400);
            expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
          }.bind(this));
          this.$httpBackend.flush();
        });

        it('should add the customer org to managedOrgList for Partner Full Admin, add entitlement, but fail to onboard to context service. Still log metrics', function () {
          spyOn(this.Authinfo, 'getManagedOrgs').and.returnValue([]);
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          var onboardPostURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard';
          var onboardGetURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard/1';
          var adminPatchURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/9/users/partnerFullAdmin/actions/configureCustomerAdmin/invoke?customerOrgId=1';
          this.$httpBackend.expectPOST(adminPatchURL).respond(204);
          this.$httpBackend.expectPOST(postURL).respond(204);
          this.$httpBackend.expectGET(onboardGetURL).respond(404);
          this.$httpBackend.expectPOST(onboardPostURL).respond(400);
          this.TrialContextService.addService('1', false).then(function (response) {
            expect(response.status).toEqual(400);
            expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
          }.bind(this));
          this.$httpBackend.flush();
        });

        it('should add entitlement, onboard context service and also log metrics', function () {
          spyOn(this.Authinfo, 'getManagedOrgs').and.returnValue(['1']);
          var postURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/1/services/contactCenterContext';
          var onboardGetURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard/1';
          this.$httpBackend.expectPOST(postURL).respond(204);
          this.$httpBackend.expectGET(onboardGetURL).respond(200);
          this.TrialContextService.addService('1', false).then(function (response) {
            expect(response.status).toEqual(200);
            expect(this.LogMetricsService.logMetrics).toHaveBeenCalled();
          }.bind(this));
          this.$httpBackend.flush();
        });

        it('fail to enable context service due to patch admin failure. still log metrics', function () {
          spyOn(this.Authinfo, 'getManagedOrgs').and.returnValue([]);
          var adminPatchURL = 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/9/users/partnerFullAdmin/actions/configureCustomerAdmin/invoke?customerOrgId=1';
          this.$httpBackend.expectPOST(adminPatchURL).respond(400);
          this.TrialContextService.addService('1', false).then(function (response) {
            expect(response.status).toEqual(400);
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
        var onboardGetURL = 'https://ccfs.appstaging.ciscoccservice.com/v1/onboard/1';
        this.$httpBackend.expectGET(getURL).respond();
        this.$httpBackend.expectGET(onboardGetURL).respond(200);
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
