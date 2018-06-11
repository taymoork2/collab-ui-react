(function () {
  'use strict';

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function HelpdeskCloudberryDeviceController($modal, $stateParams, $window, FeatureToggleService, AccessibilityService, Authinfo, HelpdeskLogService, HelpdeskService, Notification, WindowLocation) {
    $('body').css('background', 'white');
    var vm = this;
    vm.deviceId = decodeURIComponent($stateParams.id);
    vm.orgId = $stateParams.orgId;
    vm.device = $stateParams.device;
    vm.keyPressHandler = keyPressHandler;
    vm.downloadLog = downloadLog;
    vm.isAuthorizedForLog = isAuthorizedForLog;
    vm.openExtendedInformation = openExtendedInformation;
    vm.supportsExtendedInformation = false;
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

    FeatureToggleService.supports(FeatureToggleService.features.atlasHelpDeskExt).then(function (result) {
      vm.supportsExtendedInformation = result;
    });

    HelpdeskService.getCloudberryDevice(vm.orgId, vm.deviceId).then(initDeviceView, vm._helpers.notifyError);

    function initDeviceView(device) {
      vm.device = device;
      if (!vm.org.displayName) {
        // Only if there is no displayName. If set, the org name has already been read (on the search page)
        HelpdeskService.getOrgDisplayName(vm.orgId).then(function (displayName) {
          vm.org.displayName = displayName;
        }, vm._helpers.notifyError);
      }
      if (isAuthorizedForLog()) {
        HelpdeskLogService.searchForLastPushedLog(vm.device.cisUuid).then(function (log) {
          vm.lastPushedLog = log;
        }, _.noop);
      }
    }

    function isAuthorizedForLog() {
      return (Authinfo.isCisco() && (Authinfo.isSupportUser() || Authinfo.isAdmin() || Authinfo.isAppAdmin() || Authinfo.isHelpDeskUser));
    }

    function downloadLog(filename) {
      HelpdeskLogService.downloadLog(filename).then(function (tempURL) {
        WindowLocation.set(tempURL);
      });
    }

    function keyPressHandler(event) {
      if (!AccessibilityService.isVisible(AccessibilityService.MODAL) && event.keyCode === KeyCodes.ESCAPE) {
        $window.history.back();
      }
    }

    function openExtendedInformation() {
      if (vm.supportsExtendedInformation) {
        $modal.open({
          template: require('modules/squared/helpdesk/helpdesk-extended-information.html'),
          controller: 'HelpdeskExtendedInfoDialogController as modal',
          modalId: 'HelpdeskExtendedInfoDialog',
          resolve: {
            title: function () {
              return 'helpdesk.deviceDetails';
            },
            data: function () {
              return vm.device;
            },
          },
        });
      }
    }

    function notifyError(response) {
      Notification.errorResponse(response, 'helpdesk.unexpectedError');
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskCloudberryDeviceController', HelpdeskCloudberryDeviceController);
}());
