interface LoadEventScope extends ng.IScope {
  loading: boolean;
}

class LoadEvent implements ng.IDirective {
  public restrict = 'A';
  public scope = {
    loading: '=',
  };
  public link: ng.IDirectiveLinkFn = (scope: LoadEventScope, elem: JQuery) => {
    elem.bind('load', () => {
      scope.loading = false;
      scope.$apply();
    });
  }
  public static directive() {
    return new LoadEvent();
  }
}

angular.module('Core')
  .directive('loadEvent', LoadEvent.directive);
