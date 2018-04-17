'use strict';

describe('Controller: SupportCtrl', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Squared'));

  var controller, Authinfo, Userservice, currentUser, Config,
    $modal, $scope, $httpBackend, $q, FeatureToggleService, WindowLocation, UrlConfig, Notification;
  var roles = ['ciscouc.devsupport', 'atlas-portal.support'];

  beforeEach(inject(function ($controller, _$httpBackend_, _$modal_, _$q_, $rootScope, _Userservice_, _Authinfo_, _Config_, _FeatureToggleService_, _Notification_, _UrlConfig_, _WindowLocation_) {
    Userservice = _Userservice_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    WindowLocation = _WindowLocation_;
    UrlConfig = _UrlConfig_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    $q = _$q_;
    $modal = _$modal_;
    FeatureToggleService = _FeatureToggleService_;

    currentUser = {
      success: true,
      roles: ['ciscouc.devops', 'ciscouc.devsupport'],
    };

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(currentUser, 200);
    });
    spyOn($modal, 'open');
    spyOn(Authinfo, 'isCiscoMock').and.returnValue(true);
    spyOn(Authinfo, 'isCisco').and.returnValue(false);
    spyOn(Authinfo, 'isComplianceUser').and.returnValue(false);
    spyOn(Authinfo, 'isOrderAdminUser').and.returnValue(true);
    spyOn(Config, 'isProd').and.returnValue(false);
    spyOn(FeatureToggleService, 'atlasOrderProvisioningConsoleGetStatus').and.returnValue($q.resolve(true));
    $scope = $rootScope.$new();
    controller = $controller('SupportCtrl', {
      $modal: $modal,
      $scope: $scope,
      Authinfo: Authinfo,
      Userservice: Userservice,
      Config: Config,
      hasAtlasHybridCallUserTestTool: false,
    });
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should show CdrCallFlowLink for user has devsupport or devops role', function () {
    $scope.initializeShowLinks();
    expect($scope.showCdrCallFlowLink).toEqual(true);
  });

  it('should show PartnerManagementLink if user has partner management role', function () {
    var orgRoles = currentUser.roles;
    currentUser.roles.push('atlas-portal.cisco.partnermgmt');
    $scope.initializeShowLinks();
    expect($scope.showPartnerManagementLink).toEqual(true);

    // revert current user to original set of roles
    currentUser.roles = orgRoles;
  });

  it('should NOT show PartnerManagementLink if user does NOT have partner management role', function () {
    $scope.initializeShowLinks();
    expect($scope.showPartnerManagementLink).toEqual(false);
  });

  describe('ediscovery console', function () {
    it('should NOT show if user does NOT have both compliance role and ediscovery feature toggle', function () {
      expect($scope.showEdiscoveryLink()).toEqual(false);
    });

    it('should show if user has both compliance role and ediscovery feature toggle', function () {
      Authinfo.isComplianceUser.and.returnValue(true);
      $scope.initializeShowLinks();
      $scope.$apply();
      expect($scope.showEdiscoveryLink()).toEqual(true);
    });
  });

  describe('launch Order Provisioning Console', function () {
    beforeEach(function () {
      $httpBackend.whenGET('https://ciscospark.statuspage.io/index.json').respond(200, {});
      $httpBackend.whenGET('https://identity.webex.com/organization/scim/v1/Orgs/null?basicInfo=true').respond(200, {});
    });
    describe('if user has an OrderAdmin role', function () {
      it('should show the launch button if FT is set to true', function () {
        $scope.initializeShowLinks();
        $scope.$apply();
        expect($scope.showOrderProvisioningConsole).toBe(true);
      });

      it('should NOT show the launch button if FT is set to false and we are in prod. mode', function () {
        FeatureToggleService.atlasOrderProvisioningConsoleGetStatus.and.returnValue($q.resolve(false));
        Config.isProd.and.returnValue(true);
        $scope.initializeShowLinks();
        $scope.$apply();
        expect($scope.showOrderProvisioningConsole).toBe(false);
      });
      it('should show the launch button if FT is set to false and we are NOT in prod. mode', function () {
        FeatureToggleService.atlasOrderProvisioningConsoleGetStatus.and.returnValue($q.resolve(false));
        Config.isProd.and.returnValue(false);
        $scope.initializeShowLinks();
        $scope.$apply();
        expect($scope.showOrderProvisioningConsole).toBe(true);
      });
    });
    describe('if user does not have an OrderAdmin role', function () {
      it('should NOT show the launch button if FT is set to true', function () {
        Authinfo.isOrderAdminUser.and.returnValue(false);
        $scope.initializeShowLinks();
        $scope.$apply();
        expect($scope.showOrderProvisioningConsole).toBe(false);
      });
    });
    it('should return cisdoDevRole true for user that has devsupport or devops role', function () {
      var isSupportRole = $scope.isCiscoDevRole(roles);
      expect(isSupportRole).toBe(true);
    });

    describe('getCallflowCharts', function () {
      var windowUrl, expectedUrl;

      beforeEach(function () {
        windowUrl = null;
        spyOn(WindowLocation, 'set').and.callFake(function (url) {
          windowUrl = url;
        });
        spyOn(Notification, 'notify');

        // something is requiring these urls to succeed
        $httpBackend.whenGET('https://ciscospark.statuspage.io/index.json').respond(200, {});
        $httpBackend.whenGET('https://identity.webex.com/organization/scim/v1/Orgs/null?basicInfo=true').respond(200, {});

        expectedUrl = UrlConfig.getCallflowServiceUrl() +
          'callflow/logs' +
          '?orgId=aa&userId=bb' +
          '&logfileFullName=logfilename';
      });

      it('should change WindowLocation on success', function () {
        var result = {
          resultsUrl: 'http://sample.org',
        };

        $httpBackend.expectGET(expectedUrl).respond(200, result);

        $scope.getCallflowCharts('aa', 'bb', '-NA-', '-NA-', 'logfilename', true);

        $httpBackend.flush();

        expect(WindowLocation.set).toHaveBeenCalled();
        expect(windowUrl).toEqual(result.resultsUrl);
        expect(Notification.notify).not.toHaveBeenCalled();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('should notify on error', function () {
        $httpBackend.expectGET(expectedUrl).respond(503, 'error');

        $scope.getCallflowCharts('aa', 'bb', '-NA-', '-NA-', 'logfilename', true);

        $httpBackend.flush();

        expect(WindowLocation.set).not.toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalled();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });
    });
  });

  it('should open modal when openExtendedMetadata is invoked', function () {
    var metadata = 'theMetadata';

    $scope.openExtendedMetadata(metadata);
    $scope.$apply();

    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
      template: '<logs-extended-metadata metadata="metadata" dismiss="$dismiss()"></logs-extended-metadata>',
      scope: jasmine.objectContaining({
        metadata: metadata,
      }),
    }));
  });
});

