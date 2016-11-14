'use strict';

describe('controller: CbgDetailsCtrl', function () {
  var $scope, $controller, controller;
  var ccData = { groupName: 'test_callbackgroup' };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initController);

  function dependencies($rootScope, _$controller_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
  }

  function initController() {
    controller = $controller('CbgDetailsCtrl', {
      $scope: {},
      $stateParams: { info: { currCbg: ccData } }
    });
  }

  it('should have correct name attribute', function () {
    $scope.$apply();
    expect(controller.info.groupName).toBe('test_callbackgroup');
  });

});

