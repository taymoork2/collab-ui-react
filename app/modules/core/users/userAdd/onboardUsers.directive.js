'use strict';

angular.module('Core')
  .directive('crOnboardUsers', crOnboardUsers);

function crOnboardUsers() {
  return {
    restrict: 'EA',
    templateUrl: 'modules/core/users/userAdd/onboardUsers.tpl.html'
  };
}
