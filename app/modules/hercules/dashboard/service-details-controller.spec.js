'use strict';

describe('ServiceDetailsController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, controller, service;

  beforeEach(inject(function (_$controller_, $rootScope) {
    service = {
      upgradeSoftware: sinon.stub()
    };
    var stateParams = {
      cluster: {
        services: []
      }
    };
    $scope = $rootScope.$new();
    controller = _$controller_('ServiceDetailsController', {
      $scope: $scope,
      $stateParams: stateParams
    });
  }));
  it('shows modal software upgrade dialog with correct scope', function () {
    expect($scope.upgradeModal).toBeFalsy();
    var upgradePackage = {
      version: '2.0',
      release_notes: 'something',
      service: {
        display_name: 'UCM Service'
      }
    };
    var cluster = {
      id: '1',
      name: 'testcluster'
    };
    var currentVersion = "1.0";
    $scope.showUpgradeDialog(upgradePackage, cluster, currentVersion);
    expect($scope.upgradeModal).toBeTruthy();
    expect($scope.upgradePackage).toBe(upgradePackage);
    expect($scope.currentVersion).toBe(currentVersion);
  });
});
