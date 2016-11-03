'use strict';

describe('controller: GemCtrl', function () {
  var $q, $scope, $state, $controller, defer, controller, FeatureToggleService;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpecs);
  beforeEach(initController);

  function dependencies(_$q_, _$rootScope_, _$controller_, _FeatureToggleService_, _$state_) {
    $q = _$q_;
    $state = _$state_;
    defer = $q.defer();
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    FeatureToggleService = _FeatureToggleService_;
  }

  function initSpecs() {
    spyOn($state, 'go').and.returnValue($q.when());
    spyOn(FeatureToggleService, 'gemServicesTabGetStatus').and.returnValue(defer.promise);
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

    it('should run', function () {
      defer.resolve(false);
      $scope.$apply();
      expect($state.go).toHaveBeenCalled();
    });
  });
});
