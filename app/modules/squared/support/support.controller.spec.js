'use strict';

var HealthStatusType = require('modules/core/health-monitor').HealthStatusType;

describe('Controller: SupportCtrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight', 'Squared');
    this.injectDependencies(
      '$controller',
      '$httpBackend',
      '$modal',
      '$q',
      '$scope',
      '$state',
      'Authinfo',
      'Config',
      'FeatureToggleService',
      'HealthService',
      'Notification',
      'ProPackService',
      'UrlConfig',
      'Userservice',
      'WindowLocation');

    this.roles = ['ciscouc.devsupport', 'atlas-portal.support'];
    this.currentUser = {
      success: true,
      roles: ['ciscouc.devops', 'ciscouc.devsupport'],
    };

    var _this = this;
    spyOn(this.Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(_this.currentUser, 200);
    });
    spyOn(this.$modal, 'open');
    spyOn(this.Authinfo, 'isCiscoMock').and.returnValue(true);
    spyOn(this.Authinfo, 'isCisco').and.returnValue(false);
    spyOn(this.Authinfo, 'isComplianceUser').and.returnValue(false);
    spyOn(this.Authinfo, 'isOrderAdminUser').and.returnValue(true);
    spyOn(this.Config, 'isProd').and.returnValue(false);
    spyOn(this.FeatureToggleService, 'atlasOrderProvisioningConsoleGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
      components: [{
        status: HealthStatusType.OPERATIONAL,
      }],
    }));
  });

  function initController() {
    this.$controller('SupportCtrl', {
      $modal: this.$modal,
      $scope: this.$scope,
      Authinfo: this.Authinfo,
      Userservice: this.Userservice,
      Config: this.Config,
      hasAtlasHybridCallUserTestTool: false,
      HealthService: this.HealthService,
    });
    this.$scope.$apply();
  }

  it('should show CdrCallFlowLink for user has devsupport or devops role', function () {
    initController.call(this);
    this.$scope.initializeShowLinks();
    expect(this.$scope.showCdrCallFlowLink).toEqual(true);
  });

  it('should show PartnerManagementLink if user has partner management role', function () {
    initController.call(this);
    var orgRoles = this.currentUser.roles;
    this.currentUser.roles.push('atlas-portal.cisco.partnermgmt');
    this.$scope.initializeShowLinks();
    expect(this.$scope.showPartnerManagementLink).toEqual(true);

    // revert current user to original set of roles
    this.currentUser.roles = orgRoles;
  });

  it('should NOT show PartnerManagementLink if user does NOT have partner management role', function () {
    initController.call(this);
    this.$scope.initializeShowLinks();
    expect(this.$scope.showPartnerManagementLink).toEqual(false);
  });

  describe('healthyStatus', function () {
    it('should equal true', function () {
      initController.call(this);
      expect(this.$scope.healthyStatus).toBe(true);
    });

    it('should equal false', function () {
      this.HealthService.getHealthCheck.and.returnValue(this.$q.resolve({
        components: [{
          status: HealthStatusType.OPERATIONAL,
        }, {
          status: HealthStatusType.WARNING,
        }],
      }));
      initController.call(this);
      expect(this.$scope.healthyStatus).toBe(false);
    });

    it('should be undefined when HealthService failse', function () {
      this.HealthService.getHealthCheck.and.returnValue(this.$q.reject({
        status: 500,
      }));
      initController.call(this);
      expect(this.$scope.healthyStatus).toBe(undefined);
    });
  });

  describe('ediscovery console', function () {
    beforeEach(function () {
      initController.call(this);
    });

    it('should NOT show if user does NOT have both compliance role and ediscovery feature toggle', function () {
      expect(this.$scope.showEdiscoveryLink()).toEqual(false);
    });

    it('should show if user has both compliance role and ediscovery feature toggle', function () {
      this.Authinfo.isComplianceUser.and.returnValue(true);
      this.$scope.initializeShowLinks();
      this.$scope.$apply();
      expect(this.$scope.showEdiscoveryLink()).toEqual(true);
    });
  });

  describe('launch Order Provisioning Console', function () {
    beforeEach(function () {
      this.$httpBackend.whenGET('https://ciscospark.statuspage.io/index.json').respond(200, {});
      this.$httpBackend.whenGET('https://identity.webex.com/organization/scim/v1/Orgs/null?basicInfo=true').respond(200, {});
      initController.call(this);
    });
    describe('if user has an OrderAdmin role', function () {
      it('should show the launch button if FT is set to true', function () {
        this.$scope.initializeShowLinks();
        this.$scope.$apply();
        expect(this.$scope.showOrderProvisioningConsole).toBe(true);
      });

      it('should NOT show the launch button if FT is set to false and we are in prod. mode', function () {
        this.FeatureToggleService.atlasOrderProvisioningConsoleGetStatus.and.returnValue(this.$q.resolve(false));
        this.Config.isProd.and.returnValue(true);
        this.$scope.initializeShowLinks();
        this.$scope.$apply();
        expect(this.$scope.showOrderProvisioningConsole).toBe(false);
      });

      it('should show the launch button if FT is set to false and we are NOT in prod. mode', function () {
        this.FeatureToggleService.atlasOrderProvisioningConsoleGetStatus.and.returnValue(this.$q.resolve(false));
        this.Config.isProd.and.returnValue(false);
        this.$scope.initializeShowLinks();
        this.$scope.$apply();
        expect(this.$scope.showOrderProvisioningConsole).toBe(true);
      });
    });

    describe('if user does not have an OrderAdmin role', function () {
      it('should NOT show the launch button if FT is set to true', function () {
        this.Authinfo.isOrderAdminUser.and.returnValue(false);
        this.$scope.initializeShowLinks();
        this.$scope.$apply();
        expect(this.$scope.showOrderProvisioningConsole).toBe(false);
      });
    });

    it('should return cisdoDevRole true for user that has devsupport or devops role', function () {
      expect(this.$scope.isCiscoDevRole(this.roles)).toBe(true);
    });

    describe('getCallflowCharts', function () {
      beforeEach(function () {
        this.windowUrl = null;
        var _this = this;
        spyOn(this.WindowLocation, 'set').and.callFake(function (url) {
          _this.windowUrl = url;
        });
        spyOn(this.Notification, 'notify');

        // something is requiring these urls to succeed
        this.$httpBackend.whenGET('https://ciscospark.statuspage.io/index.json').respond(200, {});
        this.$httpBackend.whenGET('https://identity.webex.com/organization/scim/v1/Orgs/null?basicInfo=true').respond(200, {});

        this.expectedUrl = this.UrlConfig.getCallflowServiceUrl() +
          'callflow/logs' +
          '?orgId=aa&userId=bb' +
          '&logfileFullName=logfilename';
      });

      it('should change WindowLocation on success', function () {
        var result = {
          resultsUrl: 'http://sample.org',
        };

        this.$httpBackend.expectGET(this.expectedUrl).respond(200, result);

        this.$scope.getCallflowCharts('aa', 'bb', '-NA-', '-NA-', 'logfilename', true);

        this.$httpBackend.flush();

        expect(this.WindowLocation.set).toHaveBeenCalled();
        expect(this.windowUrl).toEqual(result.resultsUrl);
        expect(this.Notification.notify).not.toHaveBeenCalled();

        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
      });

      it('should notify on error', function () {
        this.$httpBackend.expectGET(this.expectedUrl).respond(503, 'error');

        this.$scope.getCallflowCharts('aa', 'bb', '-NA-', '-NA-', 'logfilename', true);

        this.$httpBackend.flush();

        expect(this.WindowLocation.set).not.toHaveBeenCalled();
        expect(this.Notification.notify).toHaveBeenCalled();

        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
      });
    });
  });

  it('should open modal when openExtendedMetadata is invoked', function () {
    initController.call(this);
    var metadata = 'theMetadata';

    this.$scope.openExtendedMetadata(metadata);
    this.$scope.$apply();

    expect(this.$modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
      template: '<logs-extended-metadata metadata="metadata" dismiss="$dismiss()"></logs-extended-metadata>',
      scope: jasmine.objectContaining({
        metadata: metadata,
      }),
    }));
  });

  describe('launch Meeting tab', function () {
    beforeEach(function () {
      spyOn(this.$state, 'go');
    });

    it('should NOT show the tab but go to Status tab when ProPack is disabled', function () {
      spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(false));
      spyOn(this.FeatureToggleService, 'diagnosticF8193UX3GetStatus').and.returnValue(this.$q.resolve(true));
      this.$state.current.name = 'support.meeting';
      initController.call(this);
      expect(this.$state.go).toHaveBeenCalledWith('support.status');
    });

    it('should NOT show the tab but go to Status tab when FT is set to false', function () {
      spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(true));
      spyOn(this.FeatureToggleService, 'diagnosticF8193UX3GetStatus').and.returnValue(this.$q.resolve(false));
      this.$state.current.name = 'support.meeting';
      initController.call(this);
      expect(this.$state.go).toHaveBeenCalledWith('support.status');
    });

    it('should show the tab when ProPack is enabled and FT is set to true', function () {
      spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(true));
      spyOn(this.FeatureToggleService, 'diagnosticF8193UX3GetStatus').and.returnValue(this.$q.resolve(true));
      initController.call(this);
      expect(this.$scope.tabs[0].state).toBe('support.meeting');
    });
  });
});

