(function () {
  'use strict';

  angular
    .module('uc.device')
    .directive('ucDeviceLog', ucDeviceLog);

  function ucDeviceLog() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/huron/device/deviceLog.tpl.html',
      controller: 'DeviceLogCtrl',
      controllerAs: 'ucDeviceLog'
    };

    return directive;
  }

})();
