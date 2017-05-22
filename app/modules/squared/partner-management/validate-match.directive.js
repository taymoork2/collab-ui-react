(function () {
  'use strict';

  module.exports = validateMatchDirective;

  function validateMatchDirective() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$validators.noMatch = function (value) {
          return attrs.validateMatch === value;
        };
      },
    };
  }
})();
