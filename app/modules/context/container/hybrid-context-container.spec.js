'use strict';

describe('HybridContextContainerController', function () {

  beforeEach(angular.mock.module('Context'));

  var controller, $controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  function initController(backState) {
    var $scope = {};
    controller = $controller('HybridContextContainerController', {
      $scope: $scope,
      backState: backState
    });
  }

  it('should be defined', function () {
    initController();
    expect(controller).toBeDefined();
    expect(controller.backState).toEqual('services-overview');
  });

  it('should set backState correctly', function () {
    initController('some-back-state');
    expect(controller.backState).toEqual('some-back-state');
  });
});
