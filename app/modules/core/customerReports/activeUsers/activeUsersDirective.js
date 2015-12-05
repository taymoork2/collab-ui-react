(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucActiveUserCustomer', ucActiveUserCustomer);

  function ucActiveUserCustomer() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/customerReports/activeUsers/activeUsers.tpl.html'
    };

    return directive;
  }

})();
