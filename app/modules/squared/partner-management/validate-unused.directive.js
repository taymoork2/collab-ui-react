(function () {
  'use strict';

  module.exports = validateUnusedDirective;

  function validateUnusedDirective() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$validators.unused = function (value) {
          return _.isEmpty(scope.vm.duplicateName) ||
            (value !== scope.vm.duplicateName);
        };
      },
    };
  }
}());
