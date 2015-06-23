'use strict';

angular.module('Core')
  .directive('crAssignServices', function () {
    return {
      restrict: 'EA',
      templateUrl: 'modules/core/users/userAdd/assignServices.tpl.html'
    };
  });
