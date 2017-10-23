interface ILoadEventScope extends ng.IScope {
  loadEventLoading?: boolean;
  onLoadEvent?: Function;
}

export class LoadEvent implements ng.IDirective {
  public restrict = 'A';
  public scope = {
    loadEventLoading: '=?',
    onLoadEvent: '&?',
  };
  public link: ng.IDirectiveLinkFn = (scope: ILoadEventScope, elem: JQuery) => {
    elem.on('load', () => {
      scope.loadEventLoading = false;
      scope.$apply();
      if (_.isFunction(scope.onLoadEvent)) {
        scope.onLoadEvent({
          elem: elem,
          elemScope: elem.scope(),
        });
      }
    });
  }
  public static directive() {
    return new LoadEvent();
  }
}
