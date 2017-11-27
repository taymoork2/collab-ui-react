'use strict';

describe('Directive Controller: HybridCloudberryCalendarCtrl', function () {
  beforeEach(angular.mock.module('Hercules'));

  var $scope, $rootScope, $controller, $q, USSService, $state, $stateParams, FeatureToggleService, Notification, ClusterService, ResourceGroupService, $translate, Userservice, Orgservice;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$state_, _$stateParams_, _USSService_, _$q_, _Notification_, _ClusterService_, _ResourceGroupService_, _FeatureToggleService_, _$translate_, _Userservice_, _Orgservice_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    USSService = _USSService_;
    $q = _$q_;
    $state = _$state_;
    Notification = _Notification_;
    ClusterService = _ClusterService_;
    ResourceGroupService = _ResourceGroupService_;
    FeatureToggleService = _FeatureToggleService_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;

    var resourceGroupsAsOptions = [];
    var userStatuses = [{
      userId: '1234', state: 'notActivated', serviceId: 'squared-fusion-cal', entitled: true,
    }];
    var userProps = { resourceGroups: {} };
    $stateParams.extensionId = 'squared-fusion-cal';
    $stateParams.currentUser = { id: '1234', userName: 'tvasset@cisco.com', entitlements: ['squared-fusion-cal'] };
    $stateParams.extensions = [{ id: 'squared-fusion-cal', enabled: true, isSetup: true }];

    spyOn(Notification, 'error');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Notification, 'success');
    spyOn(Notification, 'notify');
    spyOn(Userservice, 'isInvitePending').and.returnValue(false);
    spyOn(Orgservice, 'getOrg').and.returnValue($q.resolve({}));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'calsvcShowPreferredSiteNameGetStatus').and.returnValue($q.resolve(true));
    spyOn(ResourceGroupService, 'getAllAsOptions').and.returnValue($q.resolve(resourceGroupsAsOptions));
    spyOn(ResourceGroupService, 'resourceGroupHasEligibleCluster').and.returnValue($q.resolve(true));
    spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve(userStatuses));
    spyOn(USSService, 'refreshEntitlementsForUser').and.returnValue($q.resolve({}));
    spyOn(USSService, 'getUserProps').and.returnValue($q.resolve(userProps));
  }));

  function initController() {
    $controller('HybridCloudberryCalendarCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
      Userservice: Userservice,
      Orgservice: Orgservice,
      Notification: Notification,
      USSService: USSService,
      ClusterService: ClusterService,
      $translate: $translate,
      ResourceGroupService: ResourceGroupService,
      FeatureToggleService: FeatureToggleService,
    });
    $scope.$apply();
  }

  it('should init as expected when entitled and user status is OK', function () {
    initController();
    expect($scope.extension.entitled).toBeTruthy();
    expect($scope.extension.status).toBeDefined();
    expect($scope.extension.status.state).toBe('notActivated');
    expect($scope.isInvitePending).toBeFalsy();
    expect($scope.resourceGroup.show).toBeFalsy();
    expect(USSService.refreshEntitlementsForUser.calls.count()).toBe(0);
    expect(Notification.errorWithTrackingId.calls.count()).toBe(0);
  });

  it('should show the save button when entitled is toggled and remove when canceled', function () {
    initController();

    // Toggled off
    $scope.extension.entitled = false;
    $scope.$apply();
    expect($scope.extension.entitled).toBeFalsy();
    expect($scope.showButtons).toBeTruthy();

    // Canceled
    $scope.reset();
    $scope.$apply();
    expect($scope.extension.entitled).toBeTruthy();
    expect($scope.extension.id).toBe('squared-fusion-cal');
    expect($scope.extension.isExchange()).toBeTruthy();
    expect($scope.showButtons).toBeFalsy();
    expect($scope.calendarType.exchangeSetup).toBeTruthy();
    expect($scope.calendarType.googleSetup).toBeFalsy();
  });

  it('should show the unknown state and an error toaster if the service is entitled and no status is found for the service after refresh in USS', function () {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    initController();
    expect($scope.extension.entitled).toBeTruthy();
    expect($scope.extension.status.state).toBe('unknown');
    expect(Notification.error.calls.count()).toBe(1);
  });

  it('should have the correct state when google calendar is enabled and exchange disabled', function () {
    $stateParams.currentUser.entitlements = ['squared-fusion-gcal'];
    $stateParams.extensionId = 'squared-fusion-gcal';
    $stateParams.extensions = [{ id: 'squared-fusion-gcal', enabled: true, isSetup: true }, { id: 'squared-fusion-cal', enabled: false, isSetup: false }];
    initController();

    expect($scope.extension.entitled).toBeTruthy();
    expect($scope.extension.id).toBe('squared-fusion-gcal');
    expect($scope.extension.isExchange()).toBeFalsy();
    expect($scope.calendarType.exchangeSetup).toBeFalsy();
    expect($scope.calendarType.exchangeEnabled).toBeFalsy();
    expect($scope.calendarType.googleSetup).toBeTruthy();
    expect($scope.calendarType.googleEnabled).toBeFalsy();
    expect($scope.resourceGroup.show).toBeFalsy();
  });

  it('should change the extensionId when toggling between calendar types', function () {
    ResourceGroupService.getAllAsOptions.and.returnValue($q.resolve([{ label: 'Test Group', value: '1234' }]));
    $stateParams.extensions = [{ id: 'squared-fusion-gcal', enabled: true, isSetup: true }, { id: 'squared-fusion-cal', enabled: true, isSetup: true }];
    initController();

    expect($scope.extension.entitled).toBeTruthy();
    expect($scope.extension.isExchange()).toBeTruthy();
    expect($scope.calendarType.exchangeSetup).toBeTruthy();
    expect($scope.calendarType.googleSetup).toBeTruthy();
    expect($scope.resourceGroup.show).toBeTruthy();

    // Change from Exchange to Google
    $scope.selectedCalendarTypeChanged('squared-fusion-gcal');
    $scope.$apply();
    expect($scope.extension.id).toBe('squared-fusion-gcal');
    expect($scope.extension.isExchange()).toBeFalsy();
    expect($scope.resourceGroup.show).toBeFalsy();

    // Change back to Exchange
    $scope.selectedCalendarTypeChanged('squared-fusion-cal');
    $scope.$apply();
    expect($scope.extension.id).toBe('squared-fusion-cal');
    expect($scope.extension.isExchange()).toBeTruthy();
    expect($scope.resourceGroup.show).toBeTruthy();
  });
});
