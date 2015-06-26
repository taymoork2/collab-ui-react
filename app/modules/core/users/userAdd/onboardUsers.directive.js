'use strict';

angular.module('Core')
  .directive('crOnboardUsers', function () {
    return {
      restrict: 'EA',
      templateUrl: 'modules/core/users/userAdd/onboardUsers.tpl.html'
    };
  });
