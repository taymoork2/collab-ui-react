(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DeviceHeaderCtrl', DeviceHeaderCtrl);

  /* @ngInject */
  function DeviceHeaderCtrl($stateParams) {
    var vm = this;
    vm.title = '';
    vm.icon = '';

    init();
    ////////////

    function init() {
      var device = $stateParams.device;

      if (device) {
        vm.title = device.model;
        vm.icon = (device.model.trim().replace(/ /g, '_') + '.png').toLowerCase();
      }
    }

  }
})();
