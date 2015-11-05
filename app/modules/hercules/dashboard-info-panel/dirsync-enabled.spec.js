'use strict';

describe('DirsyncEnabledController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, service;

  beforeEach(inject(function (_$controller_) {
    $scope = {};
    service = {
      getDirSyncDomain: sinon.stub()
    };
    _$controller_('DirsyncEnabledController', {
      $scope: $scope,
      DirSyncService: service
    });
  }));

  it('fetches data from correct service', function () {
    expect(service.getDirSyncDomain.callCount).toEqual(1);
  });

  it('shows info panel when dirsync isnt enabled', function () {
    service.getDirSyncDomain.callArgWith(0, {
      success: true,
      serviceMode: 'ENABLED'
    });
    expect($scope.dirsyncEnabled).toBeTruthy();
    expect($scope.showInfoPanel).toBeFalsy();
  });

  it('hides info panel when dirsync is enabled', function () {
    service.getDirSyncDomain.callArgWith(0, {
      success: false,
      serviceMode: 'ENABLED'
    });
    expect($scope.dirsyncEnabled).toBeFalsy();
    expect($scope.showInfoPanel).toBeTruthy();

    service.getDirSyncDomain.callArgWith(0, {
      success: true,
      serviceMode: 'YOLO'
    });
    expect($scope.dirsyncEnabled).toBeFalsy();
    expect($scope.showInfoPanel).toBeTruthy();
  });

});
