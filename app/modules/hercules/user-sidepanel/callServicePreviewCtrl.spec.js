'use strict';

describe('Directive Controller: CallServicePreviewCtrl', function () {
  beforeEach(angular.mock.module('Hercules'));

  var $scope, $rootScope, $controller, $q, USSService, $state, $stateParams, FeatureToggleService, Notification, FusionClusterService, ResourceGroupService, $translate, Userservice, Authinfo, UriVerificationService, DomainManagementService, UCCService;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$state_, _$stateParams_, _Authinfo_, _USSService_, _$q_, _Notification_, _FusionClusterService_, _ResourceGroupService_, _FeatureToggleService_, _$translate_, _Userservice_, _UriVerificationService_, _DomainManagementService_, _UCCService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    USSService = _USSService_;
    $q = _$q_;
    $state = _$state_;
    Notification = _Notification_;
    FusionClusterService = _FusionClusterService_;
    ResourceGroupService = _ResourceGroupService_;
    FeatureToggleService = _FeatureToggleService_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;
    Userservice = _Userservice_;
    UriVerificationService = _UriVerificationService_;
    DomainManagementService = _DomainManagementService_;
    Authinfo = _Authinfo_;
    UCCService = _UCCService_;

    var resourceGroupsAsOptions = [];
    var userStatuses = [{ userId: '1234', state: 'activated', serviceId: 'squared-fusion-uc', entitled: true, clusterId: 'clusterId', connectorId: '1234' }];
    var userDiscovery = { directoryURI: 'tvasset@cisco.com' };
    var cluster = { id: 'clusterId', name: 'SuperCluster', connectors: [{ id: '1234', hostname: 'jalla.com' }] };
    var domains = [{ status: 'verified', text: 'cisco.com' }];
    $stateParams.currentUser = { id: '1234', userName: 'tvasset@cisco.com', entitlements: ['squared-fusion-uc'] };

    spyOn(Notification, 'error');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Notification, 'success');
    spyOn(Notification, 'notify');
    spyOn(Userservice, 'isInvitePending').and.returnValue(false);
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(ResourceGroupService, 'getAllAsOptions').and.returnValue($q.resolve(resourceGroupsAsOptions));
    spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve(userStatuses));
    spyOn(USSService, 'refreshEntitlementsForUser').and.returnValue($q.resolve({}));
    spyOn(UCCService, 'getUserDiscovery').and.returnValue($q.resolve(userDiscovery));
    spyOn(FusionClusterService, 'get').and.returnValue($q.resolve(cluster));
    spyOn(DomainManagementService, 'getVerifiedDomains').and.returnValue($q.resolve(domains));
  }));

  function initController() {
    $controller('CallServicePreviewCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
      Authinfo: Authinfo,
      Userservice: Userservice,
      Notification: Notification,
      USSService: USSService,
      FusionClusterService: FusionClusterService,
      UriVerificationService: UriVerificationService,
      DomainManagementService: DomainManagementService,
      $translate: $translate,
      ResourceGroupService: ResourceGroupService,
      FeatureToggleService: FeatureToggleService,
      UCCService: UCCService
    });
    $scope.$apply();
  }

  it('should init as expected when only entitled to Aware and user status is OK', function () {
    initController();
    expect($scope.callServiceAware.entitled).toBeTruthy();
    expect($scope.callServiceAware.status).toBeDefined();
    expect($scope.callServiceAware.status.state).toBe('activated');
    expect($scope.callServiceConnect.entitled).toBeFalsy();
    expect($scope.isInvitePending).toBeFalsy();
    expect($scope.resourceGroup.show).toBeFalsy();
    expect(USSService.refreshEntitlementsForUser.calls.count()).toBe(0);
    expect(Notification.errorWithTrackingId.calls.count()).toBe(0);
  });

  it('should show the save button when entitled is toggled and remove when canceled', function () {
    initController();

    // Toggled off
    $scope.callServiceAware.entitled = false;
    $scope.$apply();
    expect($scope.callServiceAware.entitled).toBeFalsy();
    expect($scope.showButtons).toBeTruthy();

    // Canceled
    $scope.reset();
    $scope.$apply();
    expect($scope.callServiceAware.entitled).toBeTruthy();
    expect($scope.showButtons).toBeFalsy();
  });

  it('should show the unknown state and an error toaster if the service is entitled and no status is found for the service after refresh in USS', function () {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    initController();
    expect($scope.callServiceAware.entitled).toBeTruthy();
    expect($scope.callServiceAware.status.state).toBe('unknown');
    expect(Notification.error.calls.count()).toBe(1);
  });

  describe('Entitled to both Aware and Connect', function () {

    beforeEach(function () {
      USSService.getStatusesForUser.and.returnValue($q.resolve([{
        userId: '1234',
        state: 'activated',
        serviceId: 'squared-fusion-uc',
        entitled: true,
        clusterId: 'clusterId',
        connectorId: '1234'
      }, { userId: '1234', state: 'activated', serviceId: 'squared-fusion-ec', entitled: true }]));
      $stateParams.currentUser = {
        id: '1234',
        userName: 'tvasset@cisco.com',
        entitlements: ['squared-fusion-uc', 'squared-fusion-ec']
      };
      $stateParams.extensions = [{ id: 'squared-fusion-ec', isSetup: true }];
    });

    it('should init as expected when entitled to Aware and Connect', function () {
      initController();

      expect($scope.callServiceAware.entitled).toBeTruthy();
      expect($scope.callServiceAware.status).toBeDefined();
      expect($scope.callServiceAware.status.state).toBe('activated');
      expect($scope.callServiceAware.homedCluster).toBeDefined();
      expect($scope.callServiceAware.homedCluster.name).toBe('SuperCluster');
      expect($scope.callServiceAware.homedConnector).toBeDefined();
      expect($scope.callServiceAware.homedConnector.hostname).toBe('jalla.com');
      expect($scope.callServiceAware.directoryUri).toBe('tvasset@cisco.com');
      expect($scope.domainVerificationError).toBeFalsy();

      expect($scope.callServiceConnect.entitled).toBeTruthy();
      expect($scope.callServiceConnect.status).toBeDefined();
      expect($scope.callServiceConnect.status.state).toBe('activated');
      expect(Notification.errorWithTrackingId.calls.count()).toBe(0);
    });

    it('should set domainVerificationError when directoryUri is not verified or claimed', function () {
      DomainManagementService.getVerifiedDomains.and.returnValue($q.resolve([]));
      initController();
      expect($scope.domainVerificationError).toBeTruthy();
      expect(Notification.errorWithTrackingId.calls.count()).toBe(0);
    });
  });
});
