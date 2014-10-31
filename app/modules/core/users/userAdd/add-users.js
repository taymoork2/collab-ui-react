'use strict';
/* global $ */

angular.module('Core')

.directive('addUsers', function() {
    return {
      restrict: 'EA',
      templateUrl: 'modules/core/users/userAdd/add-users.html',
      controller: 'UsersCtrl'
    };
  });
