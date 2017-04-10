'use strict';

describe('Controller: SubscriptionHeaderCtrl', function () {
  let $scope, rootscope, controller;

  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function ($rootScope, $controller) {
    rootscope = $rootScope;
    $scope = $rootScope.$new();

    controller = $controller('SubscriptionHeaderCtrl', {
      $scope: $scope,
    });
    $scope.$apply();
  }));

  it('should default to all false or undefined', function () {
    expect(controller.isTrial).toBeFalsy();
    expect(controller.isOnline).toBeFalsy();
    expect(controller.upgradeUrl).toBe(undefined);
  });

  it('should update on broadcast with one subscription', function () {
    rootscope.$broadcast('SUBSCRIPTION::upgradeData', {
      isOnline: true,
      isTrial: true,
      productInstanceId: 'productInstanceId',
      upgradeTrialUrl: 'Url',
      numSubscriptions: 1,
    });
    expect(controller.isTrial).toBeTruthy();
    expect(controller.isOnline).toBeTruthy();
    expect(controller.productInstanceId).toBe('productInstanceId');
    expect(controller.upgradeTrialUrl).toBe('Url');
  });

  it('should not update on broadcast with multiple subscriptions', function () {
    rootscope.$broadcast('SUBSCRIPTION::upgradeData', {
      isOnline: true,
      isTrial: true,
      productInstanceId: 'productInstanceId',
      upgradeTrialUrl: 'Url',
      numSubscriptions: 2,
    });
    expect(controller.isTrial).toBeFalsy();
    expect(controller.isOnline).toBeFalsy();
  });
});
