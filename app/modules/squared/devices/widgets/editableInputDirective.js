(function () {
  'use strict';

  angular
    .module('Squared')
    .directive('focusOn', focusOn)
    .directive('focusMe', focusMe)
    .directive('selectMe', selectMe)
    .directive('selectText', selectText);

  /* @ngInject */
  function focusOn($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.$watch($attr.focusOn, function (_focusVal) {
          $timeout(function () {
            if (_focusVal) {
              $element.focus();
            }
          }, 500);
        });
      }
    };
  }

  /* @ngInject */
  function focusMe($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        $timeout(function () {
          $element.focus();
        });
      }
    };
  }

  /* @ngInject */
  function selectMe($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        $timeout(function () {
          $element.select();
        });
      }
    };
  }

  /* @ngInject */
  function selectText($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.$watch($attr.selectText, function (_focusVal) {
          $timeout(function () {
            if (_focusVal) {
              $element.select();
            }
          });
        });
      }
    };
  }
}());
