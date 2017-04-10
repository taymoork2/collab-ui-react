require('./_user-add.scss');

(function () {
  'use strict';

  angular.module('Core')
    .directive('crAddUsersResults', crAddUsersResults);

  function crAddUsersResults() {
    return {
      restrict: 'EA',
      templateUrl: 'modules/core/users/userAdd/addUsersResults.tpl.html',
    };
  }
})();
