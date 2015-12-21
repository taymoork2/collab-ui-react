(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrl', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($q, $state, $scope, XhrNotificationService, $stateParams, $translate, $timeout, Authinfo, FeedbackService, CsdmCodeService, CsdmDeviceService, CsdmHuronDeviceService, CsdmUpgradeChannelService, Utils, $window, RemDeviceModal, ResetDeviceModal, channels, RemoteSupportModal) {
    var deviceOverview = this;

    deviceOverview.currentDevice = $stateParams.currentDevice;

    if (deviceOverview.currentDevice.isHuronDevice) {
      CsdmHuronDeviceService.getDeviceDetails(deviceOverview.currentDevice).then(function (result) {
        deviceOverview.currentDevice = result;
      });
    }

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

    deviceOverview.upgradeChannelOptions = _.map(channels, function (channel, index) {
      return {
        label: $translate.instant('CsdmStatus.upgradeChannels.' + channel),
        value: channel
      };
    });

    deviceOverview.selectedUpgradeChannel = {
      label: $translate.instant('CsdmStatus.upgradeChannels.' + deviceOverview.currentDevice.upgradeChannel),
      value: deviceOverview.currentDevice.upgradeChannel
    };

    deviceOverview.saveUpgradeChannelAndWait = function () {
      var newValue = deviceOverview.selectedUpgradeChannel.value;
      if (newValue != deviceOverview.currentDevice.upgradeChannel) {
        deviceOverview.updatingUpgradeChannel = true;
        saveUpgradeChannel(newValue)
          .then(waitForDeviceToUpdateUpgradeChannel(newValue))
          .catch(XhrNotificationService.notify)
          .finally(function () {
            deviceOverview.updatingUpgradeChannel = false;
          });
      }
    };

    function saveUpgradeChannel(newValue) {
      return CsdmUpgradeChannelService.updateUpgradeChannel(deviceOverview.currentDevice.url, newValue);
    }

    function waitForDeviceToUpdateUpgradeChannel(newValue) {
      var deferred = $q.defer();
      pollDeviceForNewChannel(newValue, new Date().getTime() + 5000, deferred);
      return deferred.promise;
    }

    function pollDeviceForNewChannel(newValue, endTime, deferred) {
      CsdmDeviceService.getDevice(deviceOverview.currentDevice.url).then(function (device) {
        if (device.upgradeChannel == newValue) {
          Notification.success($translate.instant('deviceUpgradeChannelEditPage.deviceUpdated'));
          return deferred.resolve();
        }
        if (new Date().getTime() > endTime) {
          return deferred.reject($translate.instant('deviceUpgradeChannelEditPage.updateFailed'));
        }
        $timeout(function () {
          pollDeviceForNewChannel(endTime, deferred);
        }, 1000);
      });
    }
  }
})();
