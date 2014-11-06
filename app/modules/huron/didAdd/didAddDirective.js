'use strict';

angular.module('Huron')

.directive('hnDidAdd', function () {
  return {
    restrict: 'EA',
    templateUrl: 'modules/core/users/userAdd/add-users.html',
    controller: 'UsersCtrl'
  };
});
