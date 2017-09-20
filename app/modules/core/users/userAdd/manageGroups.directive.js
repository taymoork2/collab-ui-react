(function () {
  'use strict';

  angular.module('Core')
    .directive('crManageGroups', crManageGroups);

  function crManageGroups() {
    return {
      restrict: 'EA',
      template: require('modules/core/users/userAdd/manageGroups.tpl.html'),
    };
  }
})();
