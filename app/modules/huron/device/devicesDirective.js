(function () {
  'use strict';

  angular
    .module('uc.device')
    .directive('ucDevices', ucDevices);

  function ucDevices() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/huron/device/devices.tpl.html',
      controller: 'DevicesCtrl',
      controllerAs: 'vm'
    };

    return directive;
  }

})();
