interface ILoadEventScope extends ng.IScope {
  loading: boolean;
}

export class LoadEvent implements ng.IDirective {
  public restrict = 'A';
  public scope = {
    loading: '=',
  };
  public link: ng.IDirectiveLinkFn = (scope: ILoadEventScope, elem: JQuery) => {
    elem.bind('load', () => {
      scope.loading = false;
      scope.$apply();
    });
  }
  public static directive() {
    return new LoadEvent();
  }
}
