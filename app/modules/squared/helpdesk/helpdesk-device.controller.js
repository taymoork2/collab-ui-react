(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskDeviceController($stateParams, HelpdeskService, XhrNotificationService) {
    var vm = this;
    vm.deviceId = $stateParams.id;
    vm.orgId = $stateParams.orgId;
    vm.device = $stateParams.device;
    if ($stateParams.device && $stateParams.device.organization) {
      vm.org = $stateParams.device.organization;
    } else {
      vm.org = {
        id: vm.orgId
      };
    }

    HelpdeskService.getCloudberryDevice(vm.orgId, vm.deviceId).then(initDeviceView, XhrNotificationService.notify);

    function initDeviceView(device) {
      vm.device = device;

      if (!vm.org.displayName) {
        // Only if there is no displayName. If set, the org name has already been read (on the search page)
        HelpdeskService.getOrgDisplayName(vm.orgId).then(function (displayName) {
          vm.org = displayName;
        }, XhrNotificationService.notify);
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskDeviceController', HelpdeskDeviceController);
}());
