'use strict';

describe('HybridContextContainerController', function () {

  beforeEach(angular.mock.module('Context'));

  var controller, $controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  function initController() {
    var $scope = {};
    controller = $controller('HybridContextContainerController', { $scope: $scope });
  }

  it('should be defined', function () {
    initController();
    expect(controller).toBeDefined();
  });
});
