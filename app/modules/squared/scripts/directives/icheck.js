'use strict';

angular.module('wx2AdminWebClientApp')
  .directive('icheck', icheck);

/* @ngInject */
function icheck($timeout) {
  return {
    require: 'ngModel',
    link: function ($scope, element, $attrs, ngModel) {
      return $timeout(function () {
        var value;
        value = $attrs.value;

        $scope.$watch($attrs.ngModel, function () {
          $(element).iCheck('update');
        });

        return $(element).iCheck({
          checkboxClass: 'icheckbox_square-blue'
        }).on('ifChanged', function (event) {
          if ($(element).attr('type') === 'checkbox' && $attrs.ngModel) {
            $scope.$apply(function () {
              return ngModel.$setViewValue(event.target.checked);
            });
          }
          if ($scope.validateEntitlements) {
            $scope.validateEntitlements(element);
          }
        });
      });
    }
  };
}
