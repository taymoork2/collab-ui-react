'use strict';

describe('Component: ccaCard', function () {
  var $q, $scope, $state, ctrl, $componentCtrl, FeatureToggleService;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$q_, _$state_, _$rootScope_, _$componentController_, _FeatureToggleService_) {
    $q = _$q_;
    $state = _$state_;
    $scope = _$rootScope_.$new();
    $componentCtrl = _$componentController_;
    FeatureToggleService = _FeatureToggleService_;
  }

  function initSpies() {
    spyOn($state, 'go').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve());
  }

  function initController() {
    ctrl = $componentCtrl('ccaCard', { $scope: $scope });
  }

  it('should call $state.go on init when feature toggle is missing', function () {
    FeatureToggleService.supports.and.returnValue($q.resolve(false));
    ctrl.$onInit();
    $scope.$apply();
    expect($state.go).toHaveBeenCalled();
  });

  describe('goto()', function () {
    it('should call $state.go', function () {
      ctrl.goto();
      expect($state.go).toHaveBeenCalledWith('gem.servicesPartner');
    });
  });
});
