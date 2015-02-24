'use strict';
/* global $ */

angular.module('Core')

.directive('crAddUsers', function () {
  return {
    restrict: 'EA',
    templateUrl: 'modules/core/users/userAdd/add-users.html',
    scope: true
  };
});
