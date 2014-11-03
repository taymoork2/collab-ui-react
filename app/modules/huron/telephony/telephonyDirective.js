'use strict';

angular.module('Huron')

.directive('hnTelephonyInfo', [

  function () {
    return {
      controller: 'TelephonyInfoCtrl',
      restrict: 'EA',
      templateUrl: 'modules/huron/telephony/telephony.tpl.html'
    };
  }
]);
