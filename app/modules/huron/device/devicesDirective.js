(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('hnDevices', hnDevices);

  function hnDevices() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/huron/device/devices.tpl.html',
      controller: 'DevicesCtrl',
      controllerAs: 'vm'
    };

    return directive;
  }

})();
