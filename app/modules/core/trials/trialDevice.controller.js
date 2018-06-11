(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialDeviceController', TrialDeviceController);

  /* @ngInject */
  function TrialDeviceController($scope, $stateParams, $translate, Analytics, FeatureToggleService, Notification, TrialCallService, TrialDeviceService, TrialRoomSystemService, ValidationService) {
    var vm = this;

    var _trialCallData = TrialCallService.getData();
    var _trialRoomSystemData = TrialRoomSystemService.getData();
    var _trialDeviceData = TrialDeviceService.getData();
    // used if the default contry list associated with the device needs to be patched
    // with a different value like in case of a feature toggle. If there are no shipping FTs - should be empty
    // ex: default: TrialDeviceService.listTypes.ROLLOUT2 / override: TrialDeviceService.listTypes.US_ONLY,
    var _shipCountryListReplacement = [];
    vm.deviceLimit = TrialDeviceService.getDeviceLimit();

    var trialStartDate = _.get($stateParams, 'currentTrial.startDate');
    var grandfatherMaxDeviceDate = new Date(2016, 8, 1);

    vm.parentTrialData = $scope.trialData;
    // merge is apparently not pass-by-reference
    vm.details = _.merge(_trialCallData.details, _trialRoomSystemData.details);
    vm.skipDevices = _trialDeviceData.skipDevices;
    vm.deviceTrialTip = $translate.instant('trialModal.call.deviceTrialTip');
    vm.limitsError = false;
    vm.activeDeviceLink = $translate.instant('trialModal.call.activeDeviceTrial');

    vm.isEditing = _.get($stateParams, 'isEditing');
    vm.canAddCallDevice = TrialCallService.canAddCallDevice(_.get($stateParams, 'details.details'), _trialCallData.enabled);
    vm.canAddRoomSystemDevice = TrialRoomSystemService.canAddRoomSystemDevice(_.get($stateParams, 'details.details'), _trialRoomSystemData.enabled);

    vm.getTotalQuantity = getTotalQuantity;
    vm.getTotalQuantityBeingAdded = getTotalQuantityBeingAdded;
    vm.calcQuantity = calcQuantity;
    vm.calcRelativeQuantity = calcRelativeQuantity;
    vm.skip = skip;
    vm.getQuantity = getQuantity;
    vm.getTypeQuantity = getTypeQuantity;
    vm.setQuantity = setQuantity;
    vm.validateChecks = validateChecks;
    vm.disabledChecks = disabledChecks;
    vm.hasExistingDevices = hasExistingDevices;
    vm.notifyLimits = notifyLimits;
    vm.setQuantityInputDefault = _setQuantityInputDefault;
    vm.areAdditionalDevicesAllowed = areAdditionalDevicesAllowed;
    vm.areTemplateOptionsDisabled = _areTemplateOptionsDisabled;
    vm.getCountriesForSelectedDevices = getCountriesForSelectedDevices;
    vm.showRoomTrialDevice = showRoomTrialDevice;
    vm.selectedCountryCode = null;

    vm.usStates = [];
    vm.countries = [];
    vm.getCountryList = getCountryList;
    vm.getStateList = getStateList;
    vm.countryChanged = countryChanged;
    vm.roomKitFeatureToggle = false;

    vm.validationMessages = {
      sx10: {
        trialDeviceQuantityValidator: '',
      },
      dx80: {
        trialDeviceQuantityValidator: '',
      },
      mx300: {
        trialDeviceQuantityValidator: '',
      },
      roomKit: {
        trialDeviceQuantityValidator: '',
      },
      phone8865: {
        trialDeviceQuantityValidator: '',
      },
      phone8845: {
        trialDeviceQuantityValidator: '',
      },
      phone7832: {
        trialDeviceQuantityValidator: '',
      },
      phone8841: {
        trialDeviceQuantityValidator: '',
      },
      phone7841: {
        trialDeviceQuantityValidator: '',
      },
      phone: {
        invalid: $translate.instant('common.invalidPhoneNumber'),
      },
      zip: {
        invalid: $translate.instant('common.invalidZipCode'),
      },
    };

    vm.phoneNumberValidator = {
      invalid: function (viewValue, modelValue) {
        return ValidationService.phoneAny(viewValue, modelValue);
      },
    };

    vm.zipValidator = {
      invalid: function (viewValue) {
        if (vm.selectedCountryCode === 'US') {
          return /^\d{5}$/.test(viewValue);
        } else {
          return true;
        }
      },
    };

    vm.translationData = {
      MX300: {
        max: vm.deviceLimit.CISCO_MX300.max,
      },
      roomKit: {
        max: vm.deviceLimit.CISCO_ROOM_KIT.max,
      },
    };

    if (_.has($stateParams, 'details.details.shippingInformation.country')) {
      // nothing was supplied to us and we have something from the backend
      _trialDeviceData.shippingInfo = $stateParams.details.details.shippingInformation;
    }

    if (_.get(_trialDeviceData, 'shippingInfo.country') === '') {
      // always default to USA
      _trialDeviceData.shippingInfo.country = 'United States';
      vm.selectedCountryCode = 'US';
    } else {
      vm.selectedCountryCode = TrialDeviceService.getCountryCodeByName(_trialDeviceData.shippingInfo.country);
    }

    vm.shippingInfo = _trialDeviceData.shippingInfo;
    if (_.has($stateParams, 'currentTrial.dealId')) {
      vm.shippingInfo.dealId = $stateParams.currentTrial.dealId;
    }

    vm.sx10 = _.find(_trialRoomSystemData.details.roomSystems, {
      model: 'CISCO_SX10',
    });
    vm.dx80 = _.find(_trialRoomSystemData.details.roomSystems, {
      model: 'CISCO_DX80',
    });
    vm.mx300 = _.find(_trialRoomSystemData.details.roomSystems, {
      model: 'CISCO_MX300',
    });
    vm.roomKit = _.find(_trialRoomSystemData.details.roomSystems, {
      model: 'CISCO_ROOM_KIT',
    });
    vm.phone8865 = _.find(_trialCallData.details.phones, {
      model: 'CISCO_8865',
    });
    vm.phone8845 = _.find(_trialCallData.details.phones, {
      model: 'CISCO_8845',
    });
    vm.phone8841 = _.find(_trialCallData.details.phones, {
      model: 'CISCO_8841',
    });
    vm.phone7832 = _.find(_trialCallData.details.phones, {
      model: 'CISCO_7832',
    });
    vm.phone7841 = _.find(_trialCallData.details.phones, {
      model: 'CISCO_7841',
    });

    vm.setQuantity(vm.sx10);
    vm.setQuantity(vm.dx80);
    vm.setQuantity(vm.mx300);
    vm.setQuantity(vm.roomKit);
    vm.setQuantity(vm.phone8865);
    vm.setQuantity(vm.phone8845);
    vm.setQuantity(vm.phone8841);
    vm.setQuantity(vm.phone7832);
    vm.setQuantity(vm.phone7841);

    // algendel: this notifies if any new devices have been added. Same function as __addWatcher that went away.
    // Will be removed/replaced once we componetize
    $scope.$watch(function () {
      return vm.calcQuantity(_trialRoomSystemData.details.roomSystems, _trialCallData.details.phones);
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.countries = getCountryList();
        if (!_.includes(vm.countries, vm.shippingInfo.country)) {
          vm.shippingInfo.country = null;
        }
      }
    });

    // alagendel: will be moved/replaced once we componetize
    $scope.$watch(function () {
      return vm.shippingInfo.country;
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.countryChanged();
      }
    });


    init();

    ////////////////
    function getCountriesForSelectedDevices() {
      var selectedDevices = _.chain(_.union(_trialRoomSystemData.details.roomSystems, _trialCallData.details.phones))
        .filter(function (device) {
          return device.quantity > 0 && device.enabled === true;
        })
        .map(function (device) {
          return device.model;
        }).value();
      return TrialDeviceService.getCountries(selectedDevices, _shipCountryListReplacement);
    }

    function init() {
      FeatureToggleService.atlasF281TrialRoomKitGetStatus().then(function (toggle) {
        vm.roomKitFeatureToggle = toggle;
      });

      var limitsPromise = TrialDeviceService.getLimitsPromise();

      //if we go back and unselect the service -- zero out the devices
      _resetDevicesIfNeeded(vm.canAddCallDevice, _trialCallData.details.phones);
      _resetDevicesIfNeeded(vm.canAddRoomSystemDevice, _trialRoomSystemData.details.roomSystems);

      vm.usStates = vm.getStateList();
      vm.shippingInfo.state = _.find(TrialDeviceService.getStates(), {
        abbr: vm.shippingInfo.state,
      });

      vm.shippingInfo.country = _.find(getCountriesForSelectedDevices(), {
        country: vm.shippingInfo.country,
      });

      vm.countries = getCountryList();
      Analytics.trackTrialSteps(Analytics.eventNames.ENTER_SCREEN, vm.parentTrialData);

      vm.canAddMoreDevices = vm.isEditing && vm.hasExistingDevices();
      if (!_.isUndefined(limitsPromise)) {
        limitsPromise.then(function (data) {
          vm.activeTrials = data.activeDeviceTrials;
          vm.maxTrials = data.maxDeviceTrials;
          vm.limitReached = vm.activeTrials >= vm.maxTrials;
        })
          .catch(function () {
            vm.limitsError = true;
            vm.limitReached = true;
          })
          .finally(function () {
            // Only show notification for new device trials
            if (!vm.canAddMoreDevices) {
              vm.notifyLimits();
            }
          });
      }
      trialStartDate = Date.parse(trialStartDate);
      if (trialStartDate && (trialStartDate < grandfatherMaxDeviceDate)) {
        vm.deviceLimit.callDevices.max = 5;
        vm.deviceLimit.totalDevices.max = 7;
        //bump up max to 5 for all call devices
        _.each(_.filter(vm.deviceLimit, { type: 'CALL_DEVICES' }), function (limit) {
          limit.max = 5;
        });
      }
    }

    function getCountryList() {
      return _.map(getCountriesForSelectedDevices(), 'country');
    }

    function getStateList() {
      return _.map(TrialDeviceService.getStates(), 'abbr');
    }

    function notifyLimits() {
      var remainingTrials = vm.maxTrials - vm.activeTrials;
      if (_.inRange(remainingTrials, 1, 4)) {
        Notification.warning('trialModal.call.remainingDeviceTrials', {
          number: remainingTrials,
        });
      }
    }

    function areAdditionalDevicesAllowed() {
      var result = vm.canAddMoreDevices || !vm.limitReached;
      return result;
    }

    function skip(skipped) {
      Analytics.trackTrialSteps(Analytics.eventNames.SKIP, vm.parentTrialData);
      _trialDeviceData.skipDevices = skipped;
    }

    // this total includes all devices. Added now and previously. Includes saved devices
    function getTotalQuantity() {
      var quantity = vm.calcQuantity(_trialRoomSystemData.details.roomSystems) + vm.calcQuantity(_trialCallData.details.phones);
      return quantity;
    }

    // only counts devices currently added. Used  for enabling the next step.
    function getTotalQuantityBeingAdded() {
      var quantity = calcRelativeQuantity(_trialRoomSystemData.details.roomSystems, _trialCallData.details.phones);
      return quantity;
    }

    function countryChanged() {
      if (vm.shippingInfo) {
        vm.selectedCountryCode = TrialDeviceService.getCountryCodeByName(vm.shippingInfo.country);
        vm.shippingInfo.state = null;
      }
    }

    function calcRelativeQuantity() {
      var devicesValue = _(Array.prototype.slice.call(arguments))
        .flatten()
        .value();
      var storedQuantity = vm.calcQuantity(_.filter(devicesValue, {
        readonly: true,
      }));
      var totalQuantity = vm.calcQuantity(devicesValue);
      var quantity = totalQuantity - storedQuantity;
      return quantity;
    }

    function calcQuantity() {
      var devices = Array.prototype.slice.call(arguments);
      return _(devices)
        .flatten()
        .filter({
          enabled: true,
        })
        .map('quantity')
        .reduce(_.add) || 0;
    }

    function _areTemplateOptionsDisabled(device) {
      return !device.enabled || device.readonly;
    }

    function _setQuantityInputDefault(device) {
      var limit = vm.deviceLimit[device.model] || { min: 0 };
      var disabled = !device.enabled;
      if (disabled) {
        device.quantity = 0;
      } else if (device.quantity === 0) {
        device.quantity = limit.min;
      }
    }

    function _resetDevicesIfNeeded(enabledCondition, devices) {
      if (!enabledCondition) {
        _.forEach(devices, function (device) {
          if (!device.readonly) {
            device.enabled = false;
            device.quantity = 0;
          }
        });
      }
    }

    function getTypeQuantity(deviceType) {
      var devices = (deviceType === 'roomSystems') ? _trialRoomSystemData.details.roomSystems : _trialCallData.details.phones;
      return vm.calcQuantity(devices);
    }

    function setQuantity(deviceModel) {
      var localQuantity = deviceModel.quantity;
      var storedQuantity = vm.getQuantity(deviceModel);

      // Get current quantity for addTrial else get from $stateParams
      deviceModel.quantity = localQuantity || storedQuantity;
      deviceModel.enabled = !!deviceModel.quantity;
      deviceModel.readonly = !!storedQuantity;
    }

    function getQuantity(deviceModel) {
      return _.get(_.find(_.get($stateParams, 'details.details.devices', []), {
        model: deviceModel.model,
      }), 'quantity', 0);
    }

    function disabledChecks() {
      return !_.chain(_trialCallData.details.phones)
        .concat(_trialRoomSystemData.details.roomSystems)
        .flatten()
        .filter({
          enabled: true,
        })
        .isEmpty()
        .value();
    }

    function validateChecks($viewValue, $modelValue, scope) {
      return _.get(scope, 'model.valid', disabledChecks());
    }

    function hasExistingDevices() {
      var devices = _.get($stateParams, 'details.details.devices');
      return !_.every(devices, {
        quantity: 0,
      });
    }

    function showRoomTrialDevice(device) {
      //always show dx80, roomKit only if FT is true, sx10 and mx300 only if is already in trial, or FT is false
      if (vm[device].model === vm.dx80.model) {
        return true;
      } else if (vm[device].model === vm.roomKit.model) {
        return vm.roomKitFeatureToggle;
      } else {
        return !vm.roomKitFeatureToggle || vm[device].quantity > 0;
      }
    }
  }
})();
