'use strict';

describe('controller: CbgHeaderCtrl', function () {
  var $scope, $controller, controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initController);

  function dependencies($rootScope, _$controller_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
  }

  function initController() {
    controller = $controller('CbgHeaderCtrl', {
      $scope: $scope
    });
  }

  it('should have correct backState attribute', function () {
    expect(controller.backState).toBe('gem.servicesPartner');
  });

  it('should have correct title attribute', function () {
    $scope.$emit('headerTitle', 'headerTitleVal');
    expect(controller.title).toBe('headerTitleVal');
  });
});
