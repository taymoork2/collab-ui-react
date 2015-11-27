(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskDeviceController($stateParams, HelpdeskService, XhrNotificationService) {
    var vm = this;
    vm.deviceId = $stateParams.id;
    vm.orgId = $stateParams.orgId;
    vm.device = $stateParams.device;

    HelpdeskService.getCloudberryDevice(vm.orgId, vm.deviceId).then(initDeviceView, XhrNotificationService.notify);

    HelpdeskService.getOrg(vm.orgId).then(function (res) {
      vm.org = res;
    }, XhrNotificationService.notify);

    function initDeviceView(device) {
      vm.device = device;
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskDeviceController', HelpdeskDeviceController);
}());
