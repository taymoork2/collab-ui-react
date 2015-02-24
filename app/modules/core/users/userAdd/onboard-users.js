'use strict';
/* global $ */

angular.module('Core')

.directive('crOnboardUsers', function () {
  return {
    restrict: 'EA',
    templateUrl: 'modules/core/users/userAdd/onboard-users.html',
    controller: 'OnboardCtrl'
  };
});
