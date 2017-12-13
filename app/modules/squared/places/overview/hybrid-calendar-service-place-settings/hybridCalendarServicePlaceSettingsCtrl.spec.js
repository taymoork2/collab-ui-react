'use strict';

var moduleName = require('../index').default;

describe('Controller: HybridCalendarServicePlaceSettingsCtrl', function () {
  beforeEach(angular.mock.module(moduleName));

  var $scope, $rootScope, $controller, $q, USSService, $stateParams, Notification;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$stateParams_, _USSService_, _$q_, _Notification_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    USSService = _USSService_;
    $q = _$q_;
    Notification = _Notification_;
    $stateParams = _$stateParams_;

    var userStatuses = [{
      userId: '1234', state: 'notActivated', serviceId: 'squared-fusion-cal', entitled: true,
    }];
    $stateParams.extensionId = 'squared-fusion-cal';
    $stateParams.getCurrentPlace = function () {
      return {
        id: '1234',
        userName: 'tvasset@cisco.com',
        entitlements: ['squared-fusion-cal'],
      };
    };

    spyOn(Notification, 'error');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve(userStatuses));
    spyOn(USSService, 'refreshEntitlementsForUser').and.returnValue($q.resolve({}));
  }));

  function initController() {
    $controller('HybridCalendarServicePlaceSettingsCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      Notification: Notification,
      USSService: USSService,
    });
    $scope.$apply();
  }

  it('should init as expected when place status is OK', function () {
    initController();
    expect($scope.placeStatusInUSS).toBeDefined();
    expect($scope.placeStatusInUSS.state).toBe('notActivated');
    expect(USSService.refreshEntitlementsForUser.calls.count()).toBe(0);
    expect(Notification.errorWithTrackingId.calls.count()).toBe(0);
  });

  it('should show the unknown state and an error toaster if the service is entitled and no status is found for the place after refresh in USS', function () {
    USSService.getStatusesForUser.and.returnValue($q.resolve([]));
    initController();
    expect($scope.placeStatusInUSS.state).toBe('unknown');
    expect(Notification.error.calls.count()).toBe(1);
  });
});
