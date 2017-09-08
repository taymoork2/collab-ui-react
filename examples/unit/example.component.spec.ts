import exampleModule from './index';

describe('Component: Example', () => {
  const DISABLED = 'disabled';
  const READ_ONLY = 'readonly';
  const INCREMENT_BUTTON = '#increment-button';
  const COUNT_INPUT = '#count-input';

  beforeEach(function () {
    this.initModules(exampleModule);
    this.injectDependencies(
      '$q',
      'ExampleService',
    );

    spyOn(this.ExampleService, 'getAndAddSomething');

    this.compileComponent('atlas-example');
  });

  describe('init', function () {
    it('should have an enabled increment button', function () {
      expect(this.view.find(INCREMENT_BUTTON).prop(DISABLED)).toBe(false);
    });

    it('should have 0 count and defaults', function () {
      expect(this.controller.count).toBe(0);
      expect(this.view.find(COUNT_INPUT).val()).toBe('0');
      expect(this.controller.loading).toBe(false);
      expect(this.controller.error).toBe(false);
      expect(this.controller.doneSomething).toBe(false);
    });

    it('should have a readonly count input', function () {
      expect(this.view.find(COUNT_INPUT).prop(READ_ONLY)).toBe(true);
    });
  });

  describe('increment button', function () {
    it('should increment the count', function () {
      this.view.find(INCREMENT_BUTTON).click();
      expect(this.view.find(COUNT_INPUT).val()).toBe('1');
    });

    it('should become disabled after incrementing twice', function () {
      this.view.find(INCREMENT_BUTTON).click();
      expect(this.view.find(INCREMENT_BUTTON).prop(DISABLED)).toBe(false);
      this.view.find(INCREMENT_BUTTON).click();
      expect(this.view.find(COUNT_INPUT).val()).toBe('2');
      expect(this.view.find(INCREMENT_BUTTON).prop(DISABLED)).toBe(true);
    });
  });

  describe('doSomething()', function () {
    it('should do something', function () {
      this.ExampleService.getAndAddSomething.and.returnValue(this.$q.resolve());
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
