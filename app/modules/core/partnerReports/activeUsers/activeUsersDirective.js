(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucActiveUser', ucActiveUser);

  function ucActiveUser() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/partnerReports/activeUsers/activeUsers.tpl.html'
    };

    return directive;
  }

})();
