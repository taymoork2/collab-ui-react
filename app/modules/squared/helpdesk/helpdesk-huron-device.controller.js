(function () {
  'use strict';

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function HelpdeskHuronDeviceController($stateParams, $window, AccessibilityService, HelpdeskHuronService, HelpdeskService, Notification) {
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
        id: vm.orgId,
      };
    }
    vm._helpers = {
      notifyError: notifyError,
    };

    HelpdeskHuronService.getDevice(vm.orgId, vm.deviceId).then(initDeviceView, function (err) {
      if (err.status === 404) {
        vm.notFound = true;
      } else {
        vm._helpers.notifyError(err);
      }
    });

    function initDeviceView(device) {
      vm.device = device;
      if (!vm.org.displayName) {
        // Only if there is no displayName. If set, the org name has already been read (on the search page)
        HelpdeskService.getOrgDisplayName(vm.orgId).then(function (displayName) {
          vm.org.displayName = displayName;
        }, vm._helpers.notifyError);
      }
      if (!vm.ownerUser && vm.device.ownerUser && vm.device.ownerUser.uuid) {
        HelpdeskService.getUser(vm.orgId, vm.device.ownerUser.uuid).then(function (ownerUser) {
          vm.ownerUser = ownerUser;
        }, vm._helpers.notifyError);
      }

      HelpdeskHuronService.getDeviceNumbers(vm.deviceId, vm.orgId, vm.device.ownerUser ? vm.device.ownerUser.uuid : null).then(function (deviceNumbers) {
        vm.deviceNumbers = deviceNumbers;
      }, vm._helpers.notifyError);
    }

    function keyPressHandler(event) {
      if (!AccessibilityService.isVisible(AccessibilityService.MODAL) && event.keyCode === KeyCodes.ESCAPE) {
        $window.history.back();
      }
    }

    function notifyError(response) {
      Notification.errorResponse(response, 'helpdesk.unexpectedError');
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskHuronDeviceController', HelpdeskHuronDeviceController);
}());
