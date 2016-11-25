(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrl', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($q, $state, $scope, $interval, Notification, Userservice, $stateParams, $translate, $timeout, Authinfo, FeatureToggleService, FeedbackService, CsdmDataModelService, CsdmDeviceService, CsdmUpgradeChannelService, Utils, $window, RemDeviceModal, ResetDeviceModal, channels, RemoteSupportModal, ServiceSetup, KemService, TerminusUserDeviceE911Service) {
    var deviceOverview = this;
    var huronDeviceService = $stateParams.huronDeviceService;
    deviceOverview.showPlaces = false;
    deviceOverview.linesAreLoaded = false;
    deviceOverview.tzIsLoaded = false;
    deviceOverview.shouldShowLines = function () {
      return deviceOverview.currentDevice.isHuronDevice || (deviceOverview.showPstn && deviceOverview.showPlaces);
    };

    function init() {
      fetchDisplayNameForLoggedInUser();
      fetchFeatureToggles();

      displayDevice($stateParams.currentDevice);

      CsdmDataModelService.reloadItem($stateParams.currentDevice).then(function (updatedDevice) {
        displayDevice(updatedDevice);
      });
    }

    init();

    function displayDevice(device) {

      var lastDevice = deviceOverview.currentDevice;
      deviceOverview.currentDevice = device;

      if (!lastDevice || lastDevice.product != deviceOverview.currentDevice.product) {
        deviceOverview.isKEMAvailable = KemService.isKEMAvailable(deviceOverview.currentDevice.product);
        deviceOverview.kemNumber = deviceOverview.isKEMAvailable ?
          KemService.getKemOption(deviceOverview.currentDevice.addOnModuleCount) : '';
      }

      if (deviceOverview.shouldShowLines()) {
        if (!deviceOverview.huronPollInterval) {
          deviceOverview.huronPollInterval = $interval(pollLines, 30000);
          $scope.$on("$destroy", function () {
            $interval.cancel(deviceOverview.huronPollInterval);
          });
        }
        pollLines();
      }

      if (deviceOverview.currentDevice.isHuronDevice && !deviceOverview.currentDevice.isATA) {
        if (!deviceOverview.tzIsLoaded) {
          initTimeZoneOptions().then(function () {
            loadDeviceInfo();
          });
        }
      }

      deviceOverview.deviceHasInformation = deviceOverview.currentDevice.ip || deviceOverview.currentDevice.mac || deviceOverview.currentDevice.serial || deviceOverview.currentDevice.software || deviceOverview.currentDevice.hasRemoteSupport;

      deviceOverview.canChangeUpgradeChannel = channels.length > 1 && deviceOverview.currentDevice.isOnline;

      deviceOverview.shouldShowUpgradeChannel = channels.length > 1 && !deviceOverview.currentDevice.isOnline;

      deviceOverview.upgradeChannelOptions = _.map(channels, getUpgradeChannelObject);

      resetSelectedChannel();
    }

    function getEmergencyInformation() {
      return FeatureToggleService.supports(FeatureToggleService.features.huronDeviceE911).then(function (result) {
        deviceOverview.showE911 = result;
        if (result) {
          TerminusUserDeviceE911Service.get({
            customerId: Authinfo.getOrgId(),
            number: deviceOverview.emergencyCallbackNumber
          }).$promise.then(function (info) {
            deviceOverview.emergencyAddress = info.e911Address;
            deviceOverview.emergencyAddressStatus = info.status;
          }).finally(function () {
            deviceOverview.isE911Available = true;
          });
        }
      });
    }

    function fetchDisplayNameForLoggedInUser() {
      Userservice.getUser('me', function (data) {
        if (data.success) {
          deviceOverview.adminDisplayName = data.displayName;
        }
      });
    }

    function fetchFeatureToggles() {
      FeatureToggleService.csdmPlacesGetStatus().then(function (result) {
        deviceOverview.showPlaces = result;
      });
      FeatureToggleService.csdmPstnGetStatus().then(function (result) {
        deviceOverview.showPstn = result && Authinfo.isSquaredUC();
      });
    }

    function initTimeZoneOptions() {
      deviceOverview.searchTimeZonePlaceholder = $translate.instant('serviceSetupModal.searchTimeZone');

      if (!deviceOverview.timeZoneOptions) {
        return ServiceSetup.getTimeZones().then(function (timezones) {
          deviceOverview.timeZoneOptions = ServiceSetup.getTranslatedTimeZones(timezones);
        });
      } else {
        return $q.resolve();
      }
    }

    function loadDeviceInfo() {
      huronDeviceService.getDeviceInfo(deviceOverview.currentDevice).then(function (result) {
        deviceOverview.timeZone = result.timeZone;
        deviceOverview.emergencyCallbackNumber = result.emergencyCallbackNumber;
        deviceOverview.selectedTimeZone = getTimeZoneFromId(result);
        deviceOverview.tzIsLoaded = true;
      }).then(getEmergencyInformation);
    }

    function getTimeZoneFromId(id) {
      return _.find(deviceOverview.timeZoneOptions, function (o) {
        return o.id == id;
      });
    }

    function pollLines() {
      huronDeviceService.getLinesForDevice(deviceOverview.currentDevice).then(function (result) {
        deviceOverview.lines = result;
        deviceOverview.linesAreLoaded = true;
      });
    }

    function setTimeZone(timezone) {
      return huronDeviceService.setTimezoneForDevice(deviceOverview.currentDevice, timezone).then(function () {
        deviceOverview.timeZone = timezone;
      });
    }

    deviceOverview.save = function (newName) {
      return CsdmDataModelService
        .updateItemName(deviceOverview.currentDevice, newName)
        .then(displayDevice)
        .catch(function (response) {
          Notification.errorWithTrackingId(response, 'deviceOverviewPage.failedToSaveChanges');
        });
    };

    deviceOverview.saveTimeZoneAndWait = function () {
      var newValue = deviceOverview.selectedTimeZone.id;
      if (newValue !== deviceOverview.timeZone) {
        deviceOverview.updatingTimeZone = true;
        setTimeZone(newValue)
          .then(_.partial(waitForDeviceToUpdateTimeZone, newValue))
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'deviceOverviewPage.failedToSaveChanges');
            loadDeviceInfo();
          })
          .finally(function () {
            deviceOverview.updatingTimeZone = false;
          });
      }
    };

    deviceOverview.goToEmergencyServices = function () {
      var data = {
        currentAddress: deviceOverview.emergencyAddress,
        currentNumber: deviceOverview.emergencyCallbackNumber,
        status: deviceOverview.emergencyAddressStatus,
      };

      if ($state.current.name === 'user-overview.csdmDevice' || $state.current.name === 'place-overview.csdmDevice') {
        $state.go($state.current.name + '.emergencyServices', data);
      } else {
        $state.go('device-overview.emergencyServices', data);
      }
    };

    function waitForDeviceToUpdateTimeZone(newValue) {
      var deferred = $q.defer();
      pollDeviceForNewTimeZone(newValue, new Date().getTime() + 5000, deferred);
      return deferred.promise;
    }

    function pollDeviceForNewTimeZone(newValue, endTime, deferred) {
      huronDeviceService.getDeviceInfo(deviceOverview.currentDevice).then(function (result) {
        if (result.timeZone == newValue) {
          Notification.success('deviceOverviewPage.timeZoneUpdated');
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
        .catch(function (response) {
          Notification.errorWithTrackingId(response, 'deviceOverviewPage.failedToUploadLogs');
        });
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
      if (_.isFunction(Authinfo.isReadOnlyAdmin) && Authinfo.isReadOnlyAdmin()) {
        Notification.notifyReadOnly();
        return;
      }
      if (deviceOverview.showRemoteSupportButton()) {
        RemoteSupportModal.open(deviceOverview.currentDevice);
      }
    };

    deviceOverview.showRemoteSupportButton = function () {
      return deviceOverview.currentDevice && !!deviceOverview.currentDevice.hasRemoteSupport;
    };

    deviceOverview.addTag = function () {
      var tag = _.trim(deviceOverview.newTag);
      if (tag && !_.includes(deviceOverview.currentDevice.tags, tag)) {
        deviceOverview.newTag = undefined;

        return CsdmDataModelService
          .updateTags(deviceOverview.currentDevice, deviceOverview.currentDevice.tags.concat(tag))
          .catch(function (response) {
            Notification.errorWithTrackingId(response, 'deviceOverviewPage.failedToSaveChanges');
          });

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
      return CsdmDataModelService.updateTags(deviceOverview.currentDevice, tags)
        .catch(function (response) {
          Notification.errorWithTrackingId(response, 'deviceOverviewPage.failedToSaveChanges');
        });
    };

    function resetSelectedChannel() {
      deviceOverview.selectedUpgradeChannel = deviceOverview.currentDevice.upgradeChannel;
    }

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
      if (newValue !== deviceOverview.currentDevice.upgradeChannel.value) {
        deviceOverview.updatingUpgradeChannel = true;
        saveUpgradeChannel(newValue)
          .then(_.partial(waitForDeviceToUpdateUpgradeChannel, newValue))
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'deviceOverviewPage.failedToSaveChanges');
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
      CsdmDataModelService.reloadItem(deviceOverview.currentDevice).then(function (device) {
        if (device.upgradeChannel.value == newValue) {
          Notification.success('deviceOverviewPage.channelUpdated');
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
  }
})();
