import loadEventModuleName from './index';

describe('Directive: loadEvent', () => {
  beforeEach(function () {
    this.initModules(loadEventModuleName);
    this.injectDependencies(
      '$rootScope',
      '$scope',
    );
  });

  describe('load-event-loading', () => {
    it('should change to false on load event', function () {
      this.$scope.loading = true;
      this.compileTemplate('<div load-event load-event-loading="loading"></div>');

      expect(this.$scope.loading).toBe(true);
      this.view.trigger('load');
      expect(this.$scope.loading).toBe(false);
    });
  });

  describe('on-load-event', () => {
    it('should fire callback with elemScope', function () {
      this.$rootScope.loadEventFn = jasmine.createSpy('loadEventFn');
      this.compileTemplate('<div load-event on-load-event="loadEventFn(elemScope)"></div>');

      expect(this.$rootScope.loadEventFn).not.toHaveBeenCalled();
      this.view.trigger('load');
      expect(this.$rootScope.loadEventFn).toHaveBeenCalledWith(this.$scope);
    });

    it('should fire callback with elem', function () {
      this.$rootScope.loadEventFn = jasmine.createSpy('loadEventFn');
      this.compileTemplate('<div load-event on-load-event="loadEventFn(elem)"></div>');

      expect(this.$rootScope.loadEventFn).not.toHaveBeenCalled();
      this.view.trigger('load');
      expect(this.$rootScope.loadEventFn).toHaveBeenCalledWith(this.view);
    });
  });
});
