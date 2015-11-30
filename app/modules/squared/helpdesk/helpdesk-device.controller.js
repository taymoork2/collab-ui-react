(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskDeviceController($stateParams, HelpdeskService, XhrNotificationService) {
    var vm = this;
    vm.deviceId = $stateParams.id;
    vm.orgId = $stateParams.orgId;
    vm.device = $stateParams.device;
    if ($stateParams.device) {
      vm.org = $stateParams.device.organization;
    }

    HelpdeskService.getCloudberryDevice(vm.orgId, vm.deviceId).then(initDeviceView, XhrNotificationService.notify);

    if (!vm.org || !vm.org.displayName) {
      // Only if there is no displayName. If set, the org has already been read (on the search page)
      HelpdeskService.getOrg(vm.orgId).then(function (res) {
        vm.org = res;
      }, XhrNotificationService.notify);
    }

    function initDeviceView(device) {
      vm.device = device;
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskDeviceController', HelpdeskDeviceController);
}());
