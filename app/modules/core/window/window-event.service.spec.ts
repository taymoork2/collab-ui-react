import windowModule from './index';

describe('WindowEventService', () => {
  beforeEach(function () {
    this.initModules(windowModule);
    this.injectDependencies('WindowEventService', '$rootScope', '$scope', '$window');
    this.eventListener = jasmine.createSpy('listenerSpy');
    this.eventName = 'test-event';
  });

  describe('registerEventListener', function () {
    beforeEach(function () {
      this.testEventListenerOnScope = (scope) => {
        expect(this.eventListener).not.toHaveBeenCalled();

        this.$window.dispatchEvent(new Event(this.eventName));
        expect(this.eventListener).toHaveBeenCalledTimes(1);

        this.$window.dispatchEvent(new Event(this.eventName));
        expect(this.eventListener).toHaveBeenCalledTimes(2); // triggered again

        scope.$destroy();
        this.$window.dispatchEvent(new Event(this.eventName));
        expect(this.eventListener).toHaveBeenCalledTimes(2); // not triggered again
      };
    });

    it('should trigger listener when event is fired on specified scope', function () {
      this.WindowEventService.registerEventListener(this.eventName, this.eventListener, this.$scope);
      this.testEventListenerOnScope(this.$scope);
    });
    it('should trigger listener when event is fired without specified scope', function () {
      this.WindowEventService.registerEventListener(this.eventName, this.eventListener);
      this.testEventListenerOnScope(this.$rootScope);
    });
  });
});
