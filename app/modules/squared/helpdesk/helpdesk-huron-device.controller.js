(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskHuronDeviceController($stateParams, HelpdeskHuronService, HelpdeskService, XhrNotificationService, $window) {
    $('body').css('background', 'white');
    var vm = this;
    vm.deviceId = $stateParams.id;
    vm.orgId = $stateParams.orgId;
    vm.device = $stateParams.device;
    vm.ownerUser = vm.device ? vm.device.user : null;
    vm.keyPressHandler = keyPressHandler;
    if ($stateParams.device && $stateParams.device.organization) {
      vm.org = $stateParams.device.organization;
    } else {
      vm.org = {
        id: vm.orgId
      };
    }

    HelpdeskHuronService.getDevice(vm.orgId, vm.deviceId).then(initDeviceView, function (err) {
      if (err.status === 404) {
        vm.notFound = true;
      } else {
        XhrNotificationService.notify(err);
      }
    });

    function initDeviceView(device) {
      vm.device = device;
      if (!vm.org.displayName) {
        // Only if there is no displayName. If set, the org name has already been read (on the search page)
        HelpdeskService.getOrgDisplayName(vm.orgId).then(function (displayName) {
          vm.org.displayName = displayName;
        }, XhrNotificationService.notify);
      }
      if (!vm.ownerUser && vm.device.ownerUser && vm.device.ownerUser.uuid) {
        HelpdeskService.getUser(vm.orgId, vm.device.ownerUser.uuid).then(function (ownerUser) {
          vm.ownerUser = ownerUser;
        }, XhrNotificationService.notify);
      }

      HelpdeskHuronService.getDeviceNumbers(vm.deviceId, vm.orgId, vm.device.ownerUser ? vm.device.ownerUser.uuid : null).then(function (deviceNumbers) {
        vm.deviceNumbers = deviceNumbers;
      }, XhrNotificationService.notify);

      angular.element(".helpdesk-details").focus();
    }

    function keyPressHandler(event) {
      if (event.keyCode === 27) { // Esc
        $window.history.back();
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskHuronDeviceController', HelpdeskHuronDeviceController);
}());
