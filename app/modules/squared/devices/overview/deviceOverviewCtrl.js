(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrl', DeviceOverviewCtrl);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function DeviceOverviewCtrl($element, $interval, $q, $state, $stateParams, $scope, $timeout, $translate, $window, AccessibilityService, AtaDeviceModal, Authinfo, ConfirmAtaRebootModal, CsdmDataModelService, CsdmDeviceService, CsdmUpgradeChannelService, channels, DeviceOverviewService, EmergencyServicesService, FeatureToggleService, FeedbackService, KemService, LaunchAdvancedSettingsModal, Notification, PstnModel, PstnService, RemDeviceModal, RemoteSupportModal, ResetDeviceModal, ServiceSetup, TerminusService, Utils, Userservice, WizardFactory) {
    var deviceOverview = this;
    var huronDeviceService = $stateParams.huronDeviceService;
    var adminUserDetails;
    deviceOverview.linesAreLoaded = false;
    deviceOverview.tzIsLoaded = false;
    deviceOverview.countryIsLoaded = false;
    deviceOverview.country = '';
    deviceOverview.selectedCountry = '';
    deviceOverview.hideE911Edit = true;
    deviceOverview.faxEnabled = false;
    deviceOverview.showT38 = false;
    deviceOverview.cpcFeatureToggle = false;
    deviceOverview.disableAtaRebootSettings = true;
    deviceOverview.actionList = [{
      actionKey: 'common.edit',
      actionFunction: goToEmergencyServices,
    }];

    function init() {
      FeatureToggleService.csdmAtaCpcGetStatus().then(function (response) {
        deviceOverview.cpcFeatureToggle = response;
      });
      FeatureToggleService.csdmAtaRebootGetStatus().then(function (response) {
        deviceOverview.ataRebootWarningToggle = response;
        deviceOverview.disableAtaRebootSettings = false;
      });

      displayDevice($stateParams.currentDevice);

      fetchT38Visibility();
      fetchDetailsForLoggedInUser();

      CsdmDataModelService.reloadItem($stateParams.currentDevice).then(function (updatedDevice) {
        displayDevice(updatedDevice);
      });
    }

    init();

    function fetchDetailsForLoggedInUser() {
      Userservice.getUser('me', function (data) {
        if (data.success) {
          adminUserDetails = {
            firstName: data.name && data.name.givenName,
            lastName: data.name && data.name.familyName,
            displayName: data.displayName,
            userName: data.userName,
            cisUuid: data.id,
            organizationId: data.meta.organizationID,
          };
        }
      });
    }

    function fetchT38Visibility() {
      if (deviceOverview.currentDevice.isATA) {
        FeatureToggleService.csdmT38GetStatus().then(function (t38Supported) {
          if (t38Supported) {
            if (!PstnModel.getProviderId()) {
              PstnService.getCustomer(Authinfo.getOrgId()).then(function (customer) {
                PstnService.getCarrierCapabilities(customer.pstnCarrierId).then(function (capabilities) {
                  deviceOverview.showT38 = _.some(capabilities, { capability: 'T38' });
                });
              });
            } else {
              PstnService.getCarrierCapabilities(PstnModel.getProviderId()).then(function (capabilities) {
                deviceOverview.showT38 = _.some(capabilities, { capability: 'T38' });
              });
            }
          }
        });
      }
    }

    function displayDevice(device) {
      var lastDevice = deviceOverview.currentDevice;
      var promises = [];
      deviceOverview.currentDevice = device;

      if (!lastDevice || lastDevice.product != deviceOverview.currentDevice.product) {
        deviceOverview.isKEMAvailable = KemService.isKEMAvailable(deviceOverview.currentDevice.product);
        deviceOverview.kemNumber = deviceOverview.isKEMAvailable ?
          KemService.getKemOption(deviceOverview.currentDevice.addOnModuleCount) : '';
      }

      if (!deviceOverview.huronPollInterval) {
        deviceOverview.huronPollInterval = $interval(pollLines, 30000);
        $scope.$on('$destroy', function () {
          $interval.cancel(deviceOverview.huronPollInterval);
        });
      }
      promises.push(pollLines());

      if (deviceOverview.currentDevice.isHuronDevice) {
        if (!deviceOverview.tzIsLoaded) {
          var timeZonePromise = initTimeZoneOptions().then(function () {
            return getCurrentDeviceInfo();
          });
          promises.push(timeZonePromise);
        }
        if (!deviceOverview.countryIsLoaded) {
          var countryPromise = initCountryOptions().then(function () {
            return getCurrentDeviceInfo();
          });
          promises.push(countryPromise);
        }
      }

      if (deviceOverview.currentDevice.isATA) {
        promises.push(getCurrentAtaSettings());
      }

      deviceOverview.deviceHasInformation = deviceOverview.currentDevice.ip || deviceOverview.currentDevice.mac || deviceOverview.currentDevice.serial || deviceOverview.currentDevice.software || deviceOverview.currentDevice.hasRemoteSupport;

      var placeUpgradeChannelSupported = deviceOverview.currentDevice.productFamily === 'Cloudberry' || deviceOverview.currentDevice.productFamily === 'Novum';
      deviceOverview.canChangeUpgradeChannel = channels.length > 1 && !deviceOverview.currentDevice.isHuronDevice && deviceOverview.currentDevice.isOnline && !placeUpgradeChannelSupported;
      deviceOverview.shouldShowUpgradeChannel = channels.length > 1 && !deviceOverview.currentDevice.isHuronDevice && (!deviceOverview.currentDevice.isOnline || placeUpgradeChannelSupported);

      deviceOverview.upgradeChannelOptions = _.map(channels, getUpgradeChannelObject);

      resetSelectedChannel();
      return $q.all(promises);
    }

    deviceOverview.reactivateRoomDevice = function () {
      var wizardState = {
        data: {
          function: 'showCode',
          admin: adminUserDetails,
          account: {
            type: deviceOverview.currentDevice.accountType === 'MACHINE' ? 'shared' : 'personal',
            deviceType: 'cloudberry',
            cisUuid: deviceOverview.currentDevice.cisUuid,
            name: deviceOverview.currentDevice.displayName,
            organizationId: Authinfo.getOrgId(),
          },
          recipient: {
            cisUuid: Authinfo.getUserId(),
            email: Authinfo.getPrimaryEmail(),
            displayName: adminUserDetails.displayName,
            organizationId: adminUserDetails.organizationId,
          },
          title: 'addDeviceWizard.newCode',
        },
        history: [],
        currentStateName: 'addDeviceFlow.showActivationCode',
        wizardState: {
          'addDeviceFlow.showActivationCode': {},
        },
      };
      var wizard = WizardFactory.create(wizardState);
      $state.go('addDeviceFlow.showActivationCode', {
        wizard: wizard,
      });
    };

    function getCurrentAtaSettings() {
      deviceOverview.updatingT38Settings = true;
      deviceOverview.updatingCpcSettings = true;
      return huronDeviceService.getAtaInfo(deviceOverview.currentDevice).then(function (result) {
        deviceOverview.faxEnabled = result.t38FaxEnabled;
        deviceOverview.cpcEnabled = result.cpcDelay > 2;
        deviceOverview.updatingT38Settings = false;
        deviceOverview.updatingCpcSettings = false;
      });
    }

    function getEmergencyInformation() {
      if (!deviceOverview.currentDevice.isHuronDevice) {
        deviceOverview.emergencyCallbackNumber = _.get(deviceOverview, 'lines[0].alternate');
        deviceOverview.showE911 = deviceOverview.emergencyCallbackNumber;
        if (deviceOverview.showE911) {
          getEmergencyAddress();
        } else if (_.get(deviceOverview, 'lines[0]')) {
          EmergencyServicesService.getCompanyECN().then(function (result) {
            deviceOverview.showE911 = result;
            deviceOverview.emergencyCallbackNumber = result;
            if (result) {
              deviceOverview.hideE911Edit = false;
              getEmergencyAddress();
            }
          });
        }
      } else {
        deviceOverview.showE911 = true;
        getEmergencyAddress();
      }
    }

    function getEmergencyAddress() {
      if (deviceOverview.emergencyCallbackNumber) {
        TerminusService.customerNumberE911V2().get({
          customerId: Authinfo.getOrgId(),
          number: deviceOverview.emergencyCallbackNumber,
        }).$promise.then(function (info) {
          deviceOverview.emergencyAddress = info.e911Address;
          deviceOverview.emergencyAddressStatus = info.status;
        }).then(function () {
          deviceOverview.isE911Available = true;
        }).catch(function () {
          deviceOverview.e911NotFound = true;
        });
      } else {
        deviceOverview.e911NotFound = true;
      }
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

    function initCountryOptions() {
      deviceOverview.countryPlaceholder = $translate.instant('deviceOverviewPage.countryPlaceholder');
      if (!deviceOverview.countryOptions) {
        return DeviceOverviewService.getCountryOptions().then(function (countries) {
          deviceOverview.countryOptions = countries;
        });
      } else {
        return $q.resolve();
      }
    }

    function getCurrentDeviceInfo() {
      return huronDeviceService.getDeviceInfo(deviceOverview.currentDevice).then(function (result) {
        deviceOverview.timeZone = result.timeZone;
        deviceOverview.emergencyCallbackNumber = result.emergencyCallbackNumber;
        deviceOverview.selectedTimeZone = getTimeZoneFromId(result);
        deviceOverview.tzIsLoaded = true;
        deviceOverview.country = result.country;
        deviceOverview.selectedCountry = DeviceOverviewService.findCountryByCode(deviceOverview.countryOptions, result.country);
        deviceOverview.countryIsLoaded = true;
      }).then(getEmergencyInformation);
    }

    function getTimeZoneFromId(timeZone) {
      if (timeZone && timeZone.timeZone) {
        return _.find(deviceOverview.timeZoneOptions, function (o) {
          return o.id === timeZone.timeZone;
        });
      }
    }

    function pollLines() {
      return huronDeviceService.getLinesForDevice(deviceOverview.currentDevice).then(function (result) {
        deviceOverview.lines = result;
        deviceOverview.linesAreLoaded = true;
      }).then(function () {
        if (!deviceOverview.currentDevice.isHuronDevice) {
          getEmergencyInformation();
        }
      });
    }

    function setTimeZone(timezone) {
      return huronDeviceService.setTimezoneForDevice(deviceOverview.currentDevice, timezone).then(function () {
        deviceOverview.timeZone = timezone;
      });
    }

    function setCountry(country) {
      return huronDeviceService.setCountryForDevice(deviceOverview.currentDevice, country).then(function () {
        deviceOverview.country = country;
      });
    }

    deviceOverview.saveT38Settings = function () {
      if (deviceOverview.currentDevice.isATA && deviceOverview.ataRebootWarningToggle) {
        ConfirmAtaRebootModal
          .open({
            name: $translate.instant('ataSettings.t38Label'),
          })
          .then(executeSaveT38Settings)
          .catch(getCurrentAtaSettings);
      } else {
        executeSaveT38Settings();
      }
    };

    function executeSaveT38Settings() {
      deviceOverview.updatingT38Settings = true;
      $timeout(function () {
        var settings = {
          t38FaxEnabled: deviceOverview.faxEnabled,
        };
        huronDeviceService.setSettingsForAta(deviceOverview.currentDevice, settings)
          .then(function () {
            Notification.success('ataSettings.savedT38');
          })
          .catch(function (error) {
            Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
          })
          .finally(function () {
            deviceOverview.updatingT38Settings = false;
          });
      }, 100);
    }

    deviceOverview.saveCpcSettings = function () {
      if (deviceOverview.currentDevice.isATA && deviceOverview.ataRebootWarningToggle) {
        ConfirmAtaRebootModal
          .open({
            name: $translate.instant('ataSettings.cpcLabel'),
          })
          .then(executeSaveCpcSettings)
          .catch(getCurrentAtaSettings);
      } else {
        executeSaveCpcSettings();
      }
    };

    function executeSaveCpcSettings() {
      deviceOverview.updatingCpcSettings = true;
      $timeout(function () {
        var settings = {
          cpcDelay: deviceOverview.cpcEnabled ? 240 : 2,
        };
        huronDeviceService.setSettingsForAta(deviceOverview.currentDevice, settings)
          .then(function () {
            Notification.success('ataSettings.savedCpc');
          })
          .catch(function (error) {
            Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
            getCurrentAtaSettings();
          })
          .finally(function () {
            deviceOverview.updatingCpcSettings = false;
          });
      }, 100);
    }

    deviceOverview.saveTimeZoneAndWait = function () {
      if (deviceOverview.currentDevice.isATA && deviceOverview.ataRebootWarningToggle) {
        ConfirmAtaRebootModal
          .open({ name: $translate.instant('deviceOverviewPage.timeZone') })
          .then(executeSaveTimeZoneAndWait)
          .catch(getCurrentDeviceInfo);
      } else {
        executeSaveTimeZoneAndWait();
      }
    };

    function executeSaveTimeZoneAndWait() {
      var newValue = deviceOverview.selectedTimeZone.id;
      if (newValue !== deviceOverview.timeZone) {
        deviceOverview.updatingTimeZone = true;
        setTimeZone(newValue)
          .then(_.partial(waitForDeviceToUpdateTimeZone, newValue))
          .catch(function (error) {
            Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
            getCurrentDeviceInfo();
          })
          .finally(function () {
            deviceOverview.updatingTimeZone = false;
          });
      }
    }

    deviceOverview.saveCountryAndWait = function () {
      if (deviceOverview.currentDevice.isATA && deviceOverview.ataRebootWarningToggle) {
        ConfirmAtaRebootModal
          .open({
            name: $translate.instant('deviceOverviewPage.country'),
          })
          .then(executeSaveCountryAndWait)
          .catch(getCurrentDeviceInfo);
      } else {
        executeSaveCountryAndWait();
      }
    };

    function executeSaveCountryAndWait() {
      var newValue = deviceOverview.selectedCountry.value;
      if (newValue !== deviceOverview.country) {
        deviceOverview.updatingCountry = true;
        setCountry(newValue)
          .then(_.partial(waitForDeviceToUpdateCountry, newValue))
          .catch(function (error) {
            Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
            getCurrentDeviceInfo();
          })
          .finally(function () {
            deviceOverview.updatingCountry = false;
            deviceOverview.selectedCountry = DeviceOverviewService.findCountryByCode(deviceOverview.countryOptions, newValue);
          });
      }
    }

    function goToEmergencyServices() {
      var data = {
        currentAddress: deviceOverview.emergencyAddress,
        currentNumber: deviceOverview.emergencyCallbackNumber,
        status: deviceOverview.emergencyAddressStatus,
        staticNumber: !deviceOverview.currentDevice.isHuronDevice,
      };

      if ($state.current.name === 'user-overview.csdmDevice' || $state.current.name === 'place-overview.csdmDevice') {
        $state.go($state.current.name + '.emergencyServices', data);
      } else {
        $state.go('device-overview.emergencyServices', data);
      }
    }

    function waitForDeviceToUpdateTimeZone(newValue) {
      var deferred = $q.defer();
      pollDeviceForNewTimeZone(newValue, new Date().getTime() + 5000, deferred);
      return deferred.promise;
    }

    function waitForDeviceToUpdateCountry(newValue) {
      var deferred = $q.defer();
      pollDeviceForNewCountry(newValue, new Date().getTime() + 5000, deferred);
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

    function pollDeviceForNewCountry(newValue, endTime, deferred) {
      huronDeviceService.getDeviceInfo(deviceOverview.currentDevice).then(function (result) {
        //Temporary workaround to handle null reset until CMI Device API returns null.
        if (result.country === newValue || newValue === null) {
          Notification.success('deviceOverviewPage.countryUpdated');
          return deferred.resolve();
        }
        if (new Date().getTime() > endTime) {
          return deferred.reject($translate.instant('deviceOverviewPage.countryUpdateFailed'));
        }
        $timeout(function () {
          pollDeviceForNewCountry(newValue, endTime, deferred);
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
          Notification.errorResponse(response, 'deviceOverviewPage.failedToUploadLogs');
        });
    };

    deviceOverview.deleteDevice = function () {
      RemDeviceModal
        .open(deviceOverview.currentDevice)
        .then(function () {
          $state.sidepanel.close();
          if (_.isFunction($stateParams.deviceDeleted)) {
            $stateParams.deviceDeleted(deviceOverview.currentDevice.url);
          }
        });
    };

    deviceOverview.openAtaSettings = function () {
      AtaDeviceModal
        .open(deviceOverview.currentDevice);
    };

    deviceOverview.resetDevice = function () {
      ResetDeviceModal
        .open(deviceOverview.currentDevice)
        .then($state.sidepanel.close);
    };

    deviceOverview.showAdvancedSettingsDialog = function () {
      LaunchAdvancedSettingsModal.open(deviceOverview.currentDevice);
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
          .then(function (updatedDevice) {
            return displayDevice(updatedDevice);
          })
          .catch(function (response) {
            Notification.errorResponse(response, 'deviceOverviewPage.failedToSaveChanges');
          });
      } else {
        deviceOverview.isAddingTag = false;
        deviceOverview.newTag = undefined;
      }
    };

    deviceOverview.addTagOnEnter = function ($event) {
      if ($event.keyCode === KeyCodes.ENTER) {
        deviceOverview.addTag();
      }
    };

    deviceOverview.removeTag = function (tag, index) {
      var tags = _.without(deviceOverview.currentDevice.tags, tag);
      return CsdmDataModelService.updateTags(deviceOverview.currentDevice, tags)
        .then(function (updatedDevice) {
          return displayDevice(updatedDevice);
        }, function (response) {
          // this only applies to the previous promise rejection from `updateTags()`
          Notification.errorResponse(response, 'deviceOverviewPage.failedToSaveChanges');
        })
        .catch(function (response) {
          // this applies to the `displayDevice(updatedDevice)` promise
          Notification.errorResponse(response, 'deviceOverviewPage.failedToDisplayDevice');
        })
        .finally(function () {
          if (index < deviceOverview.currentDevice.tags.length) {
            AccessibilityService.setFocus($element, '#deleteTag' + index);
          } else {
            AccessibilityService.setFocus($element, '#addNewTag');
          }
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
        value: channel,
      };
    }

    deviceOverview.saveUpgradeChannelAndWait = function () {
      var newValue = deviceOverview.selectedUpgradeChannel.value;
      if (newValue !== deviceOverview.currentDevice.upgradeChannel.value) {
        deviceOverview.updatingUpgradeChannel = true;
        saveUpgradeChannel(newValue)
          .then(_.partial(waitForDeviceToUpdateUpgradeChannel, newValue))
          .catch(function (error) {
            Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
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
        deviceOverview.currentDevice = device;
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
