'use strict';

describe('component: gemBase', function () {
  var $scope, ctrl, $componentCtrl;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initController);

  afterEach(function () {
    $scope = $componentCtrl = ctrl = undefined;
  });

  function dependencies(_$rootScope_, _$componentController_) {
    $scope = _$rootScope_.$new();
    $componentCtrl = _$componentController_;
  }


  function initController() {
    ctrl = $componentCtrl('gemBase', { $scope: $scope });
  }

  describe('$onInit', function () {
    it('should have correct backState attribute', function () {
      ctrl.$onInit();
      expect(ctrl.backState).toBe('gem.servicesPartner');
    });

    it('should have correct title attribute', function () {
      ctrl.$onInit();
      $scope.$emit('headerTitle', 'headerTitleVal');
      expect(ctrl.title).toBe('headerTitleVal');
    });
  });
});
