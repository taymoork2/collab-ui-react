'use strict';

describe('Controller: HybridContextFieldsetsCtrl', function () {

  beforeEach(angular.mock.module('Context'));

  var ctrl, $controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  function initController() {
    var $scope = {};
    ctrl = $controller('HybridContextFieldsetsCtrl', { $scope: $scope });
  }

  it('should be defined', function () {
    initController();
    expect(ctrl).toBeDefined();
  });
});
