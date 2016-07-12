'use strict';

describe('Controller: ExampleController', function () {
  function init() {
    this.initModules('AtlasExample');
    this.injectDependencies('$q', 'ExampleService');
    initSpies.apply(this);
    this.initController('ExampleController');
  }

  function initSpies() {
    spyOn(this.ExampleService, 'getAndAddSomething');
  }

  beforeEach(init);

  describe('init', function () {
    it('should initialize with 0 count', function () {
      expect(this.controller.count).toBe(0);
    });

    it('should not be loading', function () {
      expect(this.controller.loading).toBe(false);
    });

    it('should not have error', function () {
      expect(this.controller.error).toBe(false);
    });

    it('should not have done anything', function () {
      expect(this.controller.doneSomething).toBe(false);
    });
  });

  describe('incrementCount()', function () {
    beforeEach(function () {
      this.controller.incrementCount();
    });

    it('should increment the count by one', function () {
      expect(this.controller.count).toBe(1);
    });
  });

  describe('doSomething()', function () {
    it('should do something', function () {
      this.ExampleService.getAndAddSomething.and.returnValue(this.$q.when());
      this.controller.doSomething('one');

      expect(this.controller.loading).toBe(true);
      expect(this.ExampleService.getAndAddSomething).toHaveBeenCalledWith('one');
      expect(this.controller.doneSomething).toBe(false);

      this.$scope.$apply();
      expect(this.controller.loading).toBe(false);
      expect(this.controller.doneSomething).toBe(true);
      expect(this.controller.error).toBe(false);
    });

    it('should handle an error', function () {
      this.ExampleService.getAndAddSomething.and.returnValue(this.$q.reject());
      this.controller.doSomething('one');

      expect(this.controller.loading).toBe(true);
      expect(this.ExampleService.getAndAddSomething).toHaveBeenCalledWith('one');
      expect(this.controller.doneSomething).toBe(false);

      this.$scope.$apply();
      expect(this.controller.loading).toBe(false);
      expect(this.controller.doneSomething).toBe(false);
      expect(this.controller.error).toBe(true);
    });
  });
});
