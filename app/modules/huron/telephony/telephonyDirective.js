(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('hnTelephonyInfo', hnTelephonyInfo);

  function hnTelephonyInfo() {
    return {
      controller: 'TelephonyInfoCtrl',
      controllerAs: 'vm',
      restrict: 'EA',
      templateUrl: 'modules/huron/telephony/telephony.tpl.html'
    };
  }
})();
