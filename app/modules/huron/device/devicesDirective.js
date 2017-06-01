require('./_hn-devices.scss');

(function () {
  'use strict';

  angular
    .module('uc.device')
    .directive('ucDevices', ucDevices);

  function ucDevices() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/huron/device/devicesOverview.tpl.html',
      controller: 'DevicesCtrlHuron',
      controllerAs: 'ucDevices',
    };

    return directive;
  }

})();
