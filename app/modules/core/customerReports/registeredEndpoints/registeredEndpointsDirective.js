(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucDevicesCustomer', ucDevicesCustomer);

  function ucDevicesCustomer() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/customerReports/registeredEndpoints/registeredEndpoints.tpl.html'
    };

    return directive;
  }

})();
