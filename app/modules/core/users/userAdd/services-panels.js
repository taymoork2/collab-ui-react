'use strict';

angular.module('Core')

.directive('crServicesPanels', function () {
  return {
    restrict: 'EA',
    templateUrl: 'modules/core/users/userAdd/servicesPanels.tpl.html'
  };
});
