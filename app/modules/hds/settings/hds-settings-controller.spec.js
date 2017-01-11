'use strict';

describe('Controller: HDSSettingsController', function () {

  beforeEach(angular.mock.module('HDS'));

  var ctrl, $controller, $rootScope, $scope;

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
  }));

  function initController() {
    $scope = $rootScope.$new();
    ctrl = $controller('HDSSettingsController');
    $scope.$apply();
  }

  it('controller should be defined', function () {
    initController();
    expect(ctrl).toBeDefined();
  });
  it('should service model set to trial mode by default', function () {
    initController(false);
    expect(ctrl.model.serviceMode).toBe(ctrl.TRIAL);
  });

});
