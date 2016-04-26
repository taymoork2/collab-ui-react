(function () {
  'use strict';

  angular.module('Core')
    .directive('crManageGroups', crManageGroups);

  function crManageGroups() {
    return {
      restrict: 'EA',
      templateUrl: 'modules/core/users/userAdd/manageGroups.tpl.html'
    };
  }
})();
