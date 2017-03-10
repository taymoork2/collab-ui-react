export interface ITypeaheadScope extends ng.IScope {
  activeIdx?: any;
  matches?: any;
  select?: any;
}

export class DisableEnterKeyHook implements ng.IDirective {
  private static readonly KEY_TAB = 9;
  private static readonly KEY_RETURN = 13;
  private static readonly KEY_UP = 38;
  private static readonly KEY_DOWN = 40;

  public restrict: 'A';

  public link: ng.IDirectiveLinkFn = (
    scope: ITypeaheadScope,
    element: ng.IAugmentedJQuery,
  ) => {

    // Disable the collab-ui-ng keydown listener to override tab and enter hotkeys
    element.off('keydown');

    scope.$watch(function () {
      // Fire the watch if the typeahead ng-repeat has items
      let ngRepeats = angular.element(document).find('li.ng-scope[id^="typeahead-"]');
      return ngRepeats.length;
    }, function() {
      let ngRepeats = angular.element(document).find('li.ng-scope[id^="typeahead-"]');
      _.forEach(ngRepeats, function(ngRepeat) {
        // Turn off the 'keypress' listener for each typeahead ng-repeat
        angular.element(ngRepeat).off('keypress');
      });
    });

    // Add our own hotkey listener that disables tab and enter when the member if disabled
    element.on('keydown', function (event) {

      let typeaheadScope: ITypeaheadScope = angular.element(document)
                                                     .find('ul.dropdown-menu.ng-isolate-scope').scope();
      if (!typeaheadScope) {
        return;
      }

      let activeIdx = typeaheadScope.activeIdx;
      let match = typeaheadScope.matches[activeIdx];
      if (!match) {
        return;
      }

      let isDisabled = match.model['disabled'];
      switch (event.keyCode) {
        case DisableEnterKeyHook.KEY_TAB:
        case DisableEnterKeyHook.KEY_RETURN:
          if (isDisabled === true) {
            event.preventDefault();
          } else {
            typeaheadScope.select(activeIdx, event);
          }
          break;
        case DisableEnterKeyHook.KEY_UP:
          typeaheadScope.activeIdx = (activeIdx > 0 ? activeIdx : typeaheadScope.matches.length) - 1;
          typeaheadScope.$apply();
          break;
        case DisableEnterKeyHook.KEY_DOWN:
          typeaheadScope.activeIdx = (activeIdx + 1) % typeaheadScope.matches.length;
          typeaheadScope.$apply();
          break;
      }
    });
  }

  /* @ngInject */
  public static factory() {
    return new DisableEnterKeyHook();
  }
}
