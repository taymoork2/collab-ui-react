(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrl', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($q, $state, XhrNotificationService, $stateParams, Authinfo, FeedbackService, CsdmCodeService, CsdmDeviceService, Utils, $window, RemDeviceModal, ResetDeviceModal, channels, RemoteSupportModal) {
    var deviceOverview = this;

    deviceOverview.currentDevice = $stateParams.currentDevice;

    deviceOverview.save = function (newName) {
      if (deviceOverview.currentDevice.needsActivation) {
        return CsdmCodeService
          .updateCodeName(deviceOverview.currentDevice.url, newName)
          .catch(XhrNotificationService.notify);
      } else {
        return CsdmDeviceService
          .updateDeviceName(deviceOverview.currentDevice.url, newName)
          .catch(XhrNotificationService.notify);
      }
    };

    deviceOverview.reportProblem = function () {
      var feedbackId = Utils.getUUID();

      return CsdmDeviceService.uploadLogs(deviceOverview.currentDevice.url, feedbackId, Authinfo.getPrimaryEmail())
        .then(function () {
          var appType = 'Atlas_' + $window.navigator.userAgent;
          return FeedbackService.getFeedbackUrl(appType, feedbackId);
        })
        .then(function (res) {
          $window.open(res.data.url, '_blank');
        })
        .catch(XhrNotificationService.notify);
    };

    deviceOverview.deleteDevice = function () {
      RemDeviceModal
        .open(deviceOverview.currentDevice)
        .then($state.sidepanel.close);
    };

    deviceOverview.resetDevice = function () {
      ResetDeviceModal
        .open(deviceOverview.currentDevice)
        .then($state.sidepanel.close);
    };

    deviceOverview.showRemoteSupportDialog = function () {
      RemoteSupportModal.open(deviceOverview.currentDevice);
    };

    deviceOverview.canChangeUpgradeChannel = channels.length > 1 && deviceOverview.currentDevice.isOnline;
  }
})();
