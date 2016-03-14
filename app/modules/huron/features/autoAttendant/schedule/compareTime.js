(function () {
  'use strict';
  angular
    .module('uc.autoattendant')
    .directive('compareTime', CompareTime);

  /* @ngInject */
  function CompareTime() {

    return {
      require: 'ngModel',
      scope: {
        compareWith: '=compareTime',
        resetCompare: '='
      },
      link: function linkFn(scope, elem, attrs, ngModel) {
        ngModel.$validators.compareTo = function (modelValue) {
          if (modelValue && scope.compareWith) {
            return modelValue.getTime() > scope.compareWith.getTime();
          } else if (scope.resetCompare) {
            return true;
          }
          return false;
        };

        scope.$watchGroup(['compareWith', 'resetCompare'], function () {
          ngModel.$validate();
        });
      }
    };
  }
})();
