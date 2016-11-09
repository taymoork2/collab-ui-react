(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrl', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($q, $state, $scope, $interval, Notification, Userservice, $stateParams, $translate, $timeout, Authinfo, FeatureToggleService, FeedbackService, CsdmDataModelService, CsdmDeviceService, CsdmUpgradeChannelService, Utils, $window, RemDeviceModal, ResetDeviceModal, WizardFactory, channels, RemoteSupportModal, ServiceSetup, KemService) {
    var deviceOverview = this;
    deviceOverview.currentDevice = $stateParams.currentDevice;
    var huronDeviceService = $stateParams.huronDeviceService;

    deviceOverview.linesAreLoaded = false;
    deviceOverview.tzIsLoaded = false;
    deviceOverview.isKEMAvailable = KemService.isKEMAvailable(deviceOverview.currentDevice.product);
    if (deviceOverview.isKEMAvailable) {
      deviceOverview.kemNumber = KemService.getKemOption(deviceOverview.currentDevice.addOnModuleCount);
    }
    deviceOverview.showPlaces = false;

    function init() {
      fetchDisplayNameForLoggedInUser();
      fetchPlacesSupport();
    }

    init();

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

    function fetchDisplayNameForLoggedInUser() {
      Userservice.getUser('me', function (data) {
        if (data.success) {
          deviceOverview.adminDisplayName = data.displayName;
        }
      });
    }

    function fetchPlacesSupport() {
      FeatureToggleService.csdmPlacesGetStatus().then(function (result) {
        deviceOverview.showPlaces = result;
      });
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
      return CsdmDataModelService
        .updateItemName(deviceOverview.currentDevice, newName)
        .catch(function (response) {
          Notification.errorWithTrackingId(response);
        });
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
            Notification.errorWithTrackingId(error);
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
          Notification.errorWithTrackingId(response);
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

    deviceOverview.resetCode = function () {
      deviceOverview.resettingCode = true;
      var displayName = deviceOverview.currentDevice.displayName;
      CsdmDataModelService.deleteItem(deviceOverview.currentDevice)
        .then(function () {
          var wizardState = {
            data: {
              function: 'showCode',
              showPlaces: deviceOverview.showPlaces,
              account: {
                type: 'shared',
                name: displayName,
                deviceType: 'cloudberry',
              },
              recipient: {
                displayName: deviceOverview.adminDisplayName,
                cisUuid: Authinfo.getUserId(),
                email: Authinfo.getPrimaryEmail(),
                organizationId: Authinfo.getOrgId(),
              },
              title: 'addDeviceWizard.newCode'
            },
            history: [],
            currentStateName: 'addDeviceFlow.showActivationCode',
            wizardState: {
              'addDeviceFlow.showActivationCode': {}
            }
          };
          var wizard = WizardFactory.create(wizardState);
          $state.go(wizardState.currentStateName, {
            wizard: wizard
          });
        });
      $state.sidepanel.close();
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
            Notification.errorWithTrackingId(response);
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
          Notification.errorWithTrackingId(response);
        });
    };

    deviceOverview.deviceHasInformation = deviceOverview.currentDevice.ip || deviceOverview.currentDevice.mac || deviceOverview.currentDevice.serial || deviceOverview.currentDevice.software || deviceOverview.currentDevice.hasRemoteSupport || deviceOverview.currentDevice.needsActivation;

    deviceOverview.canChangeUpgradeChannel = channels.length > 1 && deviceOverview.currentDevice.isOnline;

    deviceOverview.shouldShowUpgradeChannel = channels.length > 1 && !deviceOverview.currentDevice.isOnline;

    deviceOverview.upgradeChannelOptions = _.map(channels, getUpgradeChannelObject);

    function resetSelectedChannel() {
      deviceOverview.selectedUpgradeChannel = deviceOverview.currentDevice.upgradeChannel;
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
      if (newValue !== deviceOverview.currentDevice.upgradeChannel.value) {
        deviceOverview.updatingUpgradeChannel = true;
        saveUpgradeChannel(newValue)
          .then(_.partial(waitForDeviceToUpdateUpgradeChannel, newValue))
          .catch(function (error) {
            Notification.errorWithTrackingId(error);
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
