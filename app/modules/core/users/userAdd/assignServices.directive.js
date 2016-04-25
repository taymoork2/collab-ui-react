(function() {
  'use strict';

  angular.module('Core')
    .directive('crAssignServices', crAssignServices);

  function crAssignServices() {
    return {
      restrict: 'EA',
      templateUrl: 'modules/core/users/userAdd/assignServices.tpl.html'
    };
  }
})();