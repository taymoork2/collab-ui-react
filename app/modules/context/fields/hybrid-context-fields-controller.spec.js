'use strict';

describe('HybridContextFieldsController', function () {

  beforeEach(angular.mock.module('Context'));

  var controller, $controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  function initController() {
    var $scope = {};
    controller = $controller('HybridContextFieldsController', { $scope: $scope });
  }

  it('should be defined', function () {
    initController();
    expect(controller).toBeDefined();
  });
});
