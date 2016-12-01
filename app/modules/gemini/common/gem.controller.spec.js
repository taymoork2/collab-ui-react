'use strict';

describe('controller: GemCtrl', function () {
  var $q, $scope, $state, $controller, controller, FeatureToggleService;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$q_, _$rootScope_, _$controller_, _FeatureToggleService_, _$state_) {
    $q = _$q_;
    $state = _$state_;
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    FeatureToggleService = _FeatureToggleService_;
  }

  function initSpies() {
    spyOn($state, 'go').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve());
  }

  function initController() {
    controller = $controller("GemCtrl", {
      $scope: {},
      FeatureToggleService: FeatureToggleService
    });
  }

  describe('The FeatureToggle', function () {
    it('should controller be defined', function () {
      expect(controller).toBeDefined();
    });

    it('should call $state.go', function () {
      FeatureToggleService.supports.and.returnValue($q.resolve(false));
      $scope.$apply();
      expect($state.go).toHaveBeenCalled();
    });
  });
});
