(function () {
  'use strict';

  module.exports = angular.module(require('./featureToggle.service'))
    .directive('crFeatureToggle', crFeatureToggle)
    .name;

  /* @ngInject */
  function crFeatureToggle(ngIfDirective, FeatureToggleService) {
    var ngIf = ngIfDirective[0];

    var directive = {
      restrict: 'A',
      transclude: ngIf.transclude,
      priority: ngIf.priority - 1,
      terminal: ngIf.terminal,
      link: link,
      scope: {
        featureShow: '@',
        featureHide: '@'
      }
    };

    return directive;

    function link(scope, element, attrs) {
      // defaults not to show until FeatureToggleService returns the inverse
      scope.show = false;
      scope.hide = true;
      var showFeature = scope.featureShow;
      var hideFeature = scope.featureHide;

      if (hideFeature) {
        FeatureToggleService.supports(hideFeature).then(function (value) {
          scope.hide = value;
        });
      }
      if (showFeature) {
        FeatureToggleService.supports(showFeature).then(function (value) {
          scope.show = value;
        });
      }

      attrs.ngIf = function () {
        return (showFeature && scope.show) || (hideFeature && !scope.hide);
      };
      ngIf.link.apply(ngIf, arguments);
    }
  }

})();
