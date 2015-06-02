(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucRegisteredEndpoints', ucRegisteredEndpoints);

  function ucRegisteredEndpoints() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/partnerReports/registeredEndpoints/registeredEndpoints.tpl.html'
    };

    return directive;
  }

})();
