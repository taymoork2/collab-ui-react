(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUpgradeChannelEditCtrl', DeviceUpgradeChannelEditCtrl);

  /* @ngInject */
  function DeviceUpgradeChannelEditCtrl($scope, $q, $stateParams, $timeout, $translate, XhrNotificationService, Notification, CsdmUpgradeChannelService, CsdmDeviceService, channels) {
    var deviceUpgradeChannelEdit = this;

    deviceUpgradeChannelEdit.currentDevice = $stateParams.currentDevice;

    $scope.$watch("deviceUpgradeChannelEdit.selectedChannel", function (newValue) {
      if (newValue && getOptionFromList(newValue) != deviceUpgradeChannelEdit.currentDevice.upgradeChannel) {
        saveAndWait();
      }
    });

    deviceUpgradeChannelEdit.channelOptions = _.map(channels, function (channel, index) {
      return {
        label: $translate.instant('CsdmStatus.upgradeChannels.' + channel),
        value: index + 1,
        name: "upgradeChannel",
        id: channel
      };
    });

    deviceUpgradeChannelEdit.selectedChannel = _.indexOf(channels, deviceUpgradeChannelEdit.currentDevice.upgradeChannel) + 1;

    function saveAndWait() {
      setUpdateInProgress(true);
      save()
        .then(waitForDeviceToUpdate)
        .catch(XhrNotificationService.notify)
        .finally(function () {
          setUpdateInProgress(false);
        });
    }

    function setUpdateInProgress(inProgress) {
      deviceUpgradeChannelEdit.updating = inProgress;
      _.each(deviceUpgradeChannelEdit.channelOptions, function (option) {
        option.isDisabled = inProgress;
      });
    }

    function save() {
      var selectedChannel = getOptionFromList(deviceUpgradeChannelEdit.selectedChannel);
      return CsdmUpgradeChannelService
        .updateUpgradeChannel(deviceUpgradeChannelEdit.currentDevice.url, selectedChannel);
    }

    function waitForDeviceToUpdate() {
      var deferred = $q.defer();
      pollDeviceForNewChannel(new Date().getTime() + 5000, deferred);
      return deferred.promise;
    }

    function pollDeviceForNewChannel(endTime, deferred) {
      CsdmDeviceService.getDevice(deviceUpgradeChannelEdit.currentDevice.url).then(function (device) {
        if (device.upgradeChannel == getOptionFromList(deviceUpgradeChannelEdit.selectedChannel)) {
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

    function getOptionFromList(value) {
      var option = _.find(deviceUpgradeChannelEdit.channelOptions, {
        value: value
      });
      return option && option.id;
    }
  }
})();
