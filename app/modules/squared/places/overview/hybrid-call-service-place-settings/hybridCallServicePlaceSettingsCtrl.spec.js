'use strict';

var moduleName = require('../index').default;

describe('Directive Controller: CallServicePreviewCtrl', function () {
  beforeEach(angular.mock.module(moduleName));

  var $scope, $rootScope, $controller, $q, USSService, $state, $stateParams, Notification, HybridServicesClusterService, $translate, DomainManagementService, UCCService, userDiscovery;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$state_, _$stateParams_, _USSService_, _$q_, _Notification_, _HybridServicesClusterService_, _$translate_, _DomainManagementService_, _UCCService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    USSService = _USSService_;
    $q = _$q_;
    $state = _$state_;
    Notification = _Notification_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;
    DomainManagementService = _DomainManagementService_;
    UCCService = _UCCService_;

    var userStatuses = [{
      userId: '1234', state: 'activated', serviceId: 'squared-fusion-uc', entitled: true, clusterId: 'clusterId', connectorId: '1234',
    }];
    userDiscovery = { directoryURI: 'tvasset@cisco.com' };
    var cluster = { id: 'clusterId', name: 'SuperCluster', connectors: [{ id: '1234', hostname: 'jalla.com' }] };
    var domains = [{ status: 'verified', text: 'cisco.com' }];
    $stateParams.getCurrentPlace = function () { return { id: '1234', userName: 'tvasset@cisco.com', entitlements: ['squared-fusion-uc'] }; };

    spyOn(Notification, 'error');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Notification, 'success');
    spyOn(Notification, 'notify');
    spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve(userStatuses));
    spyOn(USSService, 'refreshEntitlementsForUser').and.returnValue($q.resolve({}));
    spyOn(UCCService, 'getUserDiscovery').and.returnValue($q.resolve(userDiscovery));
    spyOn(HybridServicesClusterService, 'get').and.returnValue($q.resolve(cluster));
    spyOn(DomainManagementService, 'getVerifiedDomains').and.returnValue($q.resolve(domains));
  }));

  function initController() {
    $controller('HybridCallServicePlaceSettingsCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
      Notification: Notification,
      USSService: USSService,
      HybridServicesClusterService: HybridServicesClusterService,
      DomainManagementService: DomainManagementService,
      $translate: $translate,
      UCCService: UCCService,
    });
    $scope.$apply();
  }

  it('should init as expected when entitled to Aware and place status is OK', function () {
    initController();
    expect($scope.callServiceAware.entitled).toBeTruthy();
    expect($scope.callServiceAware.status).toBeDefined();
    expect($scope.callServiceAware.status.state).toBe('activated');
    expect(USSService.refreshEntitlementsForUser.calls.count()).toBe(0);
    expect(Notification.errorWithTrackingId.calls.count()).toBe(0);
  });

  it('should show the unknown state and an error toaster if the service is entitled and no status is found for the place after refresh in USS', function () {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    initController();
    expect($scope.callServiceAware.entitled).toBeTruthy();
    expect($scope.callServiceAware.status.state).toBe('unknown');
    expect(Notification.error.calls.count()).toBe(1);
  });

  it('should set domainVerificationError when directoryUri is not verified or claimed', function () {
    DomainManagementService.getVerifiedDomains.and.returnValue($q.resolve([]));
    initController();
    expect($scope.domainVerificationError).toBeTruthy();
    expect(Notification.errorWithTrackingId.calls.count()).toBe(0);
  });

  describe('Directory numbers', function () {
    it('Should show both separated by translation for "common.or" if both are present and not identical', function () {
      userDiscovery.primaryDn = 'dn';
      userDiscovery.telephoneNumber = 'tn';
      spyOn($translate, 'instant').and.returnValue('o');
      initController();
      expect($scope.directoryNumbers).toBe('dn o tn');
    });

    it('Should show only one if both are present and identical', function () {
      userDiscovery.primaryDn = 'dn';
      userDiscovery.telephoneNumber = 'dn';
      spyOn($translate, 'instant').and.returnValue('o');
      initController();
      expect($scope.directoryNumbers).toBe('dn');
    });

    it('Should show only primaryDn if telephoneNumber is not present', function () {
      userDiscovery.primaryDn = 'dn';
      userDiscovery.telephoneNumber = null;
      spyOn($translate, 'instant').and.returnValue('o');
      initController();
      expect($scope.directoryNumbers).toBe('dn');
    });

    it('Should show only telephoneNumber if primaryDn is not present', function () {
      userDiscovery.primaryDn = null;
      userDiscovery.telephoneNumber = 'tn';
      spyOn($translate, 'instant').and.returnValue('o');
      initController();
      expect($scope.directoryNumbers).toBe('tn');
    });
  });
});
