(function () {
  'use strict';

  angular.module('Core')
    .directive('crFeatureToggle', crFeatureToggle);

  /* @ngInject */
  function crFeatureToggle(ngIfDirective, FeatureToggleService) {
    var ngIf = ngIfDirective[0];

    var directive = {
      restrict: 'A',
      transclude: ngIf.transclude,
      priority: ngIf.priority - 1,
      terminal: ngIf.terminal,
      link: link,
      scope: true
    };

    return directive;

    function link(scope, element, attrs) {
      scope.show = false;
      scope.hide = false;
      var showFeature = attrs.featureShow;
      var hideFeature = attrs.featureHide;

      if (showFeature === 'pstnSetup') {
        scope.show = FeatureToggleService.supportsPstnSetup();
      }
      if (hideFeature === 'pstnSetup') {
        scope.hide = FeatureToggleService.supportsPstnSetup();
      }

      //TODO add a generic FeatureToggleService.isEnabled(feature)

      attrs.ngIf = function () {
        return (showFeature && scope.show) || (hideFeature && !scope.hide);
      };
      ngIf.link.apply(ngIf, arguments);
    }
  }

})();
