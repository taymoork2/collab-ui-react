require('./_user-add.scss');

(function () {
  'use strict';

  angular.module('Core')
    .directive('crAssignServices', crAssignServices);

  function crAssignServices() {
    return {
      restrict: 'EA',
      template: require('modules/core/users/userAdd/assignServices.tpl.html'),
    };
  }
})();
