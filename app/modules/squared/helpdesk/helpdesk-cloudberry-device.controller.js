(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskCloudberryDeviceController($stateParams, HelpdeskService, XhrNotificationService, HelpdeskLogService, Authinfo, $window, WindowLocation) {
    $('body').css('background', 'white');
    var vm = this;
    vm.deviceId = $stateParams.id;
    vm.orgId = $stateParams.orgId;
    vm.device = $stateParams.device;
    vm.keyPressHandler = keyPressHandler;
    vm.downloadLog = downloadLog;
    vm.isAuthorizedForLog = isAuthorizedForLog;
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
          vm.org.displayName = displayName;
        }, XhrNotificationService.notify);
      }
      if (isAuthorizedForLog()) {
        HelpdeskLogService.searchForLastPushedLog(vm.device.cisUuid).then(function (log) {
          vm.lastPushedLog = log;
        }, angular.noop);
      }

      angular.element(".helpdesk-details").focus();
    }

    function isAuthorizedForLog() {
      return (Authinfo.isCisco() && (Authinfo.isSupportUser() || Authinfo.isAdmin() || Authinfo.isAppAdmin()));
    }

    function downloadLog(filename) {
      HelpdeskLogService.downloadLog(filename).then(function (tempURL) {
        WindowLocation.set(tempURL);
      });
    }

    function keyPressHandler(event) {
      if (event.keyCode === 27) { // Esc
        $window.history.back();
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskCloudberryDeviceController', HelpdeskCloudberryDeviceController);
}());
