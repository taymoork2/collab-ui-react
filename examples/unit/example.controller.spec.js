'use strict';

describe('Controller: ExampleController', function () {
  var controller, $scope, $controller, $q, ExampleService;

  beforeEach(module('AtlasExample'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies($rootScope, _$controller_, _$q_, _ExampleService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    ExampleService = _ExampleService_;
  }

  function initSpies() {
    spyOn(ExampleService, 'getAndAddSomething');
  }

  function initController() {
    controller = $controller('ExampleController', {
      $scope: $scope
    });
    $scope.$apply();
  }

  describe('init', function () {
    it('should initialize with 0 count', function () {
      expect(controller.count).toBe(0);
    });

    it('should not be loading', function () {
      expect(controller.loading).toBe(false);
    });

    it('should not have error', function () {
      expect(controller.error).toBe(false);
    });

    it('should not have done anything', function () {
      expect(controller.doneSomething).toBe(false);
    });
  });

  describe('incrementCount()', function () {
    beforeEach(function () {
      controller.incrementCount();
    });

    it('should increment the count by one', function () {
      expect(controller.count).toBe(1);
    });
  });

  describe('doSomething()', function () {
    it('should do something', function () {
      ExampleService.getAndAddSomething.and.returnValue($q.when());
      controller.doSomething('one');

      expect(controller.loading).toBe(true);
      expect(ExampleService.getAndAddSomething).toHaveBeenCalledWith('one');
      expect(controller.doneSomething).toBe(false);

      $scope.$apply();
      expect(controller.loading).toBe(false);
      expect(controller.doneSomething).toBe(true);
      expect(controller.error).toBe(false);
    });

    it('should handle an error', function () {
      ExampleService.getAndAddSomething.and.returnValue($q.reject());
      controller.doSomething('one');

      expect(controller.loading).toBe(true);
      expect(ExampleService.getAndAddSomething).toHaveBeenCalledWith('one');
      expect(controller.doneSomething).toBe(false);

      $scope.$apply();
      expect(controller.loading).toBe(false);
      expect(controller.doneSomething).toBe(false);
      expect(controller.error).toBe(true);
    });
  });
});
