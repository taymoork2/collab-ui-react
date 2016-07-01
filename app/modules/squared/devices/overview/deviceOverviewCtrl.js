(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrl', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($q, $state, $scope, $interval, XhrNotificationService, Notification, $stateParams, $translate, $timeout, Authinfo, FeedbackService, CsdmCodeService, CsdmDeviceService, CsdmUpgradeChannelService, Utils, $window, RemDeviceModal, ResetDeviceModal, AddDeviceModal, channels, RemoteSupportModal, ServiceSetup, KemService, CmiKemService) {
    var deviceOverview = this;

    deviceOverview.currentDevice = $stateParams.currentDevice;
    var huronDeviceService = $stateParams.huronDeviceService;

    deviceOverview.linesAreLoaded = false;
    deviceOverview.tzIsLoaded = false;
    deviceOverview.isError = false;
    deviceOverview.isKEMAvailable = KemService.isKEMAvailable(deviceOverview.currentDevice.product);
    if (deviceOverview.isKEMAvailable) {
      if (!_.has(deviceOverview.currentDevice, 'kem')) {
        deviceOverview.currentDevice.kem = [];
        deviceOverview.isError = true;
      }
      deviceOverview.kemNumber = KemService.getKemOption(deviceOverview.currentDevice.kem.length);
      deviceOverview.kemOptions = KemService.getOptionList(deviceOverview.currentDevice.product);
    }
    deviceOverview.saveInProcess = false;

    if (deviceOverview.currentDevice.isHuronDevice) {
      initTimeZoneOptions().then(function () {
        loadDeviceTimeZone();
      });
      var huronPollInterval = $interval(pollLines, 30000);
      $scope.$on("$destroy", function () {
        $interval.cancel(huronPollInterval);
      });
      pollLines();
    }

    function loadDeviceTimeZone() {
      huronDeviceService.getTimezoneForDevice(deviceOverview.currentDevice).then(function (result) {
        deviceOverview.timeZone = result;
        deviceOverview.selectedTimeZone = getTimeZoneFromId(result);
        deviceOverview.tzIsLoaded = true;
      });
    }

    function getTimeZoneFromId(id) {
      return _.find(deviceOverview.timeZoneOptions, function (o) {
        return o.id == id;
      });
    }

    function initTimeZoneOptions() {
      deviceOverview.searchTimeZonePlaceholder = $translate.instant('serviceSetupModal.searchTimeZone');
      return ServiceSetup.getTimeZones().then(function (timezones) {
        deviceOverview.timeZoneOptions = ServiceSetup.getTranslatedTimeZones(timezones);
      });
    }

    function pollLines() {
      huronDeviceService.getLinesForDevice(deviceOverview.currentDevice).then(function (result) {
        deviceOverview.lines = result;
        deviceOverview.linesAreLoaded = true;
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

    function setTimeZone(timezone) {
      return huronDeviceService.setTimezoneForDevice(deviceOverview.currentDevice, timezone).then(function () {
        deviceOverview.timeZone = timezone;
      });
    }

    deviceOverview.saveTimeZoneAndWait = function () {
      var newValue = deviceOverview.selectedTimeZone.id;
      if (newValue !== deviceOverview.timeZone) {
        deviceOverview.updatingTimeZone = true;
        setTimeZone(newValue)
          .then(_.partial(waitForDeviceToUpdateTimeZone, newValue))
          .catch(function (error) {
            XhrNotificationService.notify(error);
            loadDeviceTimeZone();
          })
          .finally(function () {
            deviceOverview.updatingTimeZone = false;
          });
      }
    };

    function waitForDeviceToUpdateTimeZone(newValue) {
      var deferred = $q.defer();
      pollDeviceForNewTimeZone(newValue, new Date().getTime() + 5000, deferred);
      return deferred.promise;
    }

    function pollDeviceForNewTimeZone(newValue, endTime, deferred) {
      huronDeviceService.getTimezoneForDevice(deviceOverview.currentDevice).then(function (result) {
        if (result == newValue) {
          Notification.success($translate.instant('deviceOverviewPage.timeZoneUpdated'));
          return deferred.resolve();
        }
        if (new Date().getTime() > endTime) {
          return deferred.reject($translate.instant('deviceOverviewPage.timeZoneUpdateFailed'));
        }
        $timeout(function () {
          pollDeviceForNewTimeZone(newValue, endTime, deferred);
        }, 1000);
      });
    }

    deviceOverview.reportProblem = function () {
      var uploadLogsPromise;
      var feedbackId;
      if (deviceOverview.currentDevice.isHuronDevice) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        feedbackId = '';
        for (var i = 32; i > 0; --i) {
          feedbackId += chars[Math.floor(Math.random() * chars.length)];
        }
        uploadLogsPromise = huronDeviceService.uploadLogs(deviceOverview.currentDevice, feedbackId);
      } else {
        feedbackId = Utils.getUUID();
        uploadLogsPromise = CsdmDeviceService.uploadLogs(deviceOverview.currentDevice.url, feedbackId, Authinfo.getPrimaryEmail());
      }

      uploadLogsPromise.then(function () {
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

    deviceOverview.resetCode = function () {
      deviceOverview.resettingCode = true;
      var displayName = deviceOverview.currentDevice.displayName;
      CsdmCodeService.deleteCode(deviceOverview.currentDevice);
      CsdmCodeService.createCode(displayName)
        .then(function (result) {
          AddDeviceModal.open(result);
        })
        .then($state.sidepanel.close);
    };

    deviceOverview.showRemoteSupportDialog = function () {
      RemoteSupportModal.open(deviceOverview.currentDevice);
    };

    deviceOverview.addTag = function () {
      var tag = _.trim(deviceOverview.newTag);
      if (tag && !_.contains(deviceOverview.currentDevice.tags, tag)) {
        deviceOverview.newTag = undefined;
        var service = (deviceOverview.currentDevice.needsActivation ? CsdmCodeService : deviceOverview.currentDevice.isHuronDevice ? huronDeviceService : CsdmDeviceService);
        return service
          .updateTags(deviceOverview.currentDevice.url, deviceOverview.currentDevice.tags.concat(tag))
          .catch(XhrNotificationService.notify);
      } else {
        deviceOverview.isAddingTag = false;
        deviceOverview.newTag = undefined;
      }
    };

    deviceOverview.addTagOnEnter = function ($event) {
      if ($event.keyCode == 13) {
        deviceOverview.addTag();
      }
    };

    deviceOverview.removeTag = function (tag) {
      var tags = _.without(deviceOverview.currentDevice.tags, tag);
      return (deviceOverview.currentDevice.needsActivation ? CsdmCodeService : deviceOverview.currentDevice.isHuronDevice ? huronDeviceService : CsdmDeviceService)
        .updateTags(deviceOverview.currentDevice.url, tags)
        .catch(XhrNotificationService.notify);
    };

    deviceOverview.deviceHasInformation = deviceOverview.currentDevice.ip || deviceOverview.currentDevice.mac || deviceOverview.currentDevice.serial || deviceOverview.currentDevice.software || deviceOverview.currentDevice.hasRemoteSupport || deviceOverview.currentDevice.needsActivation;

    deviceOverview.canChangeUpgradeChannel = channels.length > 1 && deviceOverview.currentDevice.isOnline;

    deviceOverview.upgradeChannelOptions = _.map(channels, getUpgradeChannelObject);

    function resetSelectedChannel() {
      deviceOverview.selectedUpgradeChannel = getUpgradeChannelObject(deviceOverview.currentDevice.upgradeChannel);
    }

    resetSelectedChannel();

    function getUpgradeChannelObject(channel) {
      var labelKey = 'CsdmStatus.upgradeChannels.' + channel;
      var label = $translate.instant('CsdmStatus.upgradeChannels.' + channel);
      if (label === labelKey) {
        label = channel;
      }
      return {
        label: label,
        value: channel
      };
    }

    deviceOverview.saveUpgradeChannelAndWait = function () {
      var newValue = deviceOverview.selectedUpgradeChannel.value;
      if (newValue !== deviceOverview.currentDevice.upgradeChannel) {
        deviceOverview.updatingUpgradeChannel = true;
        saveUpgradeChannel(newValue)
          .then(_.partial(waitForDeviceToUpdateUpgradeChannel, newValue))
          .catch(function (error) {
            XhrNotificationService.notify(error);
            resetSelectedChannel();
          })
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
          Notification.success($translate.instant('deviceOverviewPage.channelUpdated'));
          return deferred.resolve();
        }
        if (new Date().getTime() > endTime) {
          return deferred.reject($translate.instant('deviceOverviewPage.channelUpdateFailed'));
        }
        $timeout(function () {
          pollDeviceForNewChannel(newValue, endTime, deferred);
        }, 1000);
      });
    }

    deviceOverview.save = function () {
      deviceOverview.saveInProcess = true;
      var device = deviceOverview.currentDevice;
      var previousKemNumber = device.kem.length;
      var newKemNumber = deviceOverview.kemNumber.value;
      var diff = newKemNumber - previousKemNumber;
      var promiseList = [];
      if (diff > 0) {
        _.times(diff, function (n) {
          promiseList.push(CmiKemService.createKEM(device.huronId, previousKemNumber + 1 + n));
        });
      } else {
        _.times(-diff, function (n) {
          var module = _.findWhere(device.kem, {
            index: '' + (previousKemNumber - n)
          });
          promiseList.push(CmiKemService.deleteKEM(device.huronId, module.uuid));
        });
      }
      promiseList.push(CmiKemService.getKEM(device.huronId));
      $q.all(promiseList).then(
        function (data) {
          device.kem = data[data.length - 1];
          deviceOverview.saveInProcess = false;
        },
        function () {
          deviceOverview.kemNumber = KemService.getKemOption(previousKemNumber);
          Notification.error($translate.instant('deviceOverviewPage.deviceChangesFailed'));
          deviceOverview.saveInProcess = false;
        }
      );
      deviceOverview.saveInProcess = false;
      deviceOverview.form.$setPristine();
      deviceOverview.form.$setUntouched();
    };

    deviceOverview.reset = function () {
      deviceOverview.kemNumber = KemService.getKemOption(deviceOverview.currentDevice.kem.length);
      deviceOverview.form.$setPristine();
      deviceOverview.form.$setUntouched();
    };
  }
})();
