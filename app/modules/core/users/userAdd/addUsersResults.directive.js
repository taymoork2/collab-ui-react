require('./_user-add.scss');

(function () {
  'use strict';

  angular.module('Core')
    .directive('crAddUsersResultsXxx', crAddUsersResults);

  function crAddUsersResults() {
    return {
      restrict: 'EA',
      template: require('modules/core/users/userAdd/addUsersResults.tpl.html'),
    };
  }
})();
