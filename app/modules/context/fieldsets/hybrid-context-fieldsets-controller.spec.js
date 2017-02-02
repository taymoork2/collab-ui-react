'use strict';

describe('Controller: HybridContextFieldsetsController', function () {

  beforeEach(angular.mock.module('Context'));

  var ctrl, $controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  function initController() {
    var $scope = {};
    ctrl = $controller('HybridContextFieldsetsController', { $scope: $scope });
  }

  it('should be defined', function () {
    initController();
    expect(ctrl).toBeDefined();
  });
});
