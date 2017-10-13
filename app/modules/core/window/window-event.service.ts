export class WindowEventService {
  private static readonly DESTROY = '$destroy';

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $window: ng.IWindowService,
  ) {}

  /**
   * Utility to safely add/remove a window event listener
   */
  public registerEventListener(eventName: string, eventListener: EventListenerOrEventListenerObject, scopeOnDestroy: ng.IScope = this.$rootScope): void {
    this.$window.addEventListener(eventName, eventListener);
    scopeOnDestroy.$on(WindowEventService.DESTROY, () => {
      this.$window.removeEventListener(eventName, eventListener);
    });
  }
}
