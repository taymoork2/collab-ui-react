(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialDeviceController', TrialDeviceController);

  /* @ngInject */
  function TrialDeviceController($stateParams, $translate, Notification, TrialCallService, TrialDeviceService, TrialRoomSystemService) {
    var vm = this;

    var _trialCallData = TrialCallService.getData();
    var _trialRoomSystemData = TrialRoomSystemService.getData();
    var _trialDeviceData = TrialDeviceService.getData();

    // merge is apparently not pass-by-reference
    vm.details = _.merge(_trialCallData.details, _trialRoomSystemData.details);
    vm.skipDevices = _trialDeviceData.skipDevices;
    vm.deviceTrialTip = $translate.instant('trialModal.call.deviceTrialTip');
    vm.limitsError = false;

    vm.isEditing = _.get($stateParams, 'isEditing');
    vm.canAddCallDevice = TrialCallService.canAddCallDevice(_.get($stateParams, 'details.details'), _trialCallData.enabled);
    vm.canAddRoomSystemDevice = TrialRoomSystemService.canAddRoomSystemDevice(_.get($stateParams, 'details.details'), _trialRoomSystemData.enabled);
    vm.validateInputQuantity = validateInputQuantity;
    vm.validateRoomSystemsQuantity = validateRoomSystemsQuantity;
    vm.validatePhonesQuantity = validatePhonesQuantity;
    vm.validateTotalQuantity = validateTotalQuantity;
    vm.calcQuantity = calcQuantity;
    vm.calcRelativeQuantity = calcRelativeQuantity;
    vm.skip = skip;
    vm.getQuantity = getQuantity;
    vm.setQuantity = setQuantity;
    vm.validateChecks = validateChecks;
    vm.toggleShipFields = toggleShipFields;
    vm.disabledChecks = disabledChecks;
    vm.hasExistingDevices = hasExistingDevices;
    vm.notifyLimits = notifyLimits;
    vm.getQuantityInputDefault = _getQuantityInputDefault;

    if (_.get(_trialDeviceData, 'shippingInfo.country') === '') {
      // always default to USA
      _trialDeviceData.shippingInfo.country = 'United States';
      if (_.has($stateParams, 'details.details.shippingInformation.country')) {
        // nothing was supplied to us and we have something from the backend
        _trialDeviceData.shippingInfo = $stateParams.details.details.shippingInformation;
      }
    }
    vm.shippingInfo = _trialDeviceData.shippingInfo;
    if (_.has($stateParams, 'currentTrial.dealId')) {
      vm.shippingInfo.dealId = $stateParams.currentTrial.dealId;
    }

    vm.sx10 = _.find(_trialRoomSystemData.details.roomSystems, {
      model: 'CISCO_SX10'
    });
    vm.phone8865 = _.find(_trialCallData.details.phones, {
      model: 'CISCO_8865'
    });
    vm.phone8845 = _.find(_trialCallData.details.phones, {
      model: 'CISCO_8845'
    });
    vm.phone8841 = _.find(_trialCallData.details.phones, {
      model: 'CISCO_8841'
    });
    vm.phone7841 = _.find(_trialCallData.details.phones, {
      model: 'CISCO_7841'
    });

    vm.setQuantity(vm.sx10);
    vm.setQuantity(vm.phone8865);
    vm.setQuantity(vm.phone8845);
    vm.setQuantity(vm.phone8841);
    vm.setQuantity(vm.phone7841);

    vm.roomSystemFields = [{
      model: vm.sx10,
      key: 'enabled',
      type: 'checkbox',
      className: 'pull-left medium-5 medium-offset-1',
      templateOptions: {
        label: $translate.instant('trialModal.call.sx10'),
        id: 'cameraSX10',
        labelClass: 'medium-offset-1',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.canAddRoomSystemDevice;
        }
      },
      watcher: _checkWatcher(),
      validators: _checkValidators()
    }, {
      model: vm.sx10,
      key: 'quantity',
      type: 'input',
      className: 'pull-left medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'pull-left medium-6 text-right',
        inputClass: 'pull-left medium-5 medium-offset-1 ui--mt-',
        type: 'number',
        max: 5,
        min: 2,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },
      validation: {
        show: true
      },

      expressionProperties: {
        'templateOptions.required': function () {
          return vm.sx10.enabled;
        },
        'templateOptions.disabled': function () {
          return !vm.sx10.enabled || vm.sx10.readonly;
        },
        'model.quantity': function () {
          return vm.getQuantityInputDefault(vm.sx10, 2);
        }

      },
      watcher: _addWatcher(),
      validators: _addRoomSystemValidators()
    }];

    vm.deskPhoneFields = [{
      model: vm.phone8865,
      key: 'enabled',
      type: 'checkbox',
      className: 'pull-left medium-5 medium-offset-1',
      templateOptions: {
        label: $translate.instant('trialModal.call.phone8865'),
        id: 'phone8865',
        labelClass: 'medium-offset-1',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.canAddCallDevice;
        }
      },
      watcher: _checkWatcher(),
      validators: _checkValidators()
    }, {
      model: vm.phone8865,
      key: 'quantity',
      type: 'input',
      className: 'pull-left medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'pull-left medium-6 text-right',
        inputClass: 'pull-left medium-5 medium-offset-1 ui--mt-',
        type: 'number',
        max: 5,
        min: 1,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },
      validation: {
        show: true
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.phone8865.enabled;
        },
        'templateOptions.disabled': function () {
          return !vm.phone8865.enabled || vm.phone8865.readonly;
        },
        'model.quantity': function () {
          return vm.getQuantityInputDefault(vm.phone8865, 1);
        }
      },
      watcher: _addWatcher(),
      validators: _addPhonesValidators()
    }, {
      model: vm.phone8845,
      key: 'enabled',
      type: 'checkbox',
      className: 'pull-left medium-5 medium-offset-1',
      templateOptions: {
        label: $translate.instant('trialModal.call.phone8845'),
        id: 'phone8845',
        labelClass: 'medium-offset-1',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.canAddCallDevice;
        }
      },
      watcher: _checkWatcher(),
      validators: _checkValidators()
    }, {
      model: vm.phone8845,
      key: 'quantity',
      type: 'input',
      className: 'pull-left medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'pull-left medium-6 text-right',
        inputClass: 'pull-left medium-5 medium-offset-1 ui--mt-',
        type: 'number',
        max: 5,
        min: 1,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },
      validation: {
        show: true
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.phone8845.enabled;
        },
        'templateOptions.disabled': function () {
          return !vm.phone8845.enabled || vm.phone8845.readonly;
        },
        'model.quantity': function () {
          return vm.getQuantityInputDefault(vm.phone8845, 1);
        }

      },
      watcher: _addWatcher(),
      validators: _addPhonesValidators()
    }, {
      model: vm.phone8841,
      key: 'enabled',
      type: 'checkbox',
      className: 'pull-left medium-5 medium-offset-1',
      templateOptions: {
        label: $translate.instant('trialModal.call.phone8841'),
        id: 'phone8841',
        labelClass: 'medium-offset-1',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.canAddCallDevice;
        }
      },
      watcher: _checkWatcher(),
      validators: _checkValidators()
    }, {
      model: vm.phone8841,
      key: 'quantity',
      type: 'input',
      className: 'pull-left medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'pull-left medium-6 text-right',
        inputClass: 'pull-left medium-5 medium-offset-1 ui--mt-',
        type: 'number',
        max: 5,
        min: 1,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },
      validation: {
        show: true
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.phone8841.enabled;
        },
        'templateOptions.disabled': function () {
          return !vm.phone8841.enabled || vm.phone8841.readonly;
        },
        'model.quantity': function () {
          return vm.getQuantityInputDefault(vm.phone8841, 1);
        }
      },
      watcher: _addWatcher(),
      validators: _addPhonesValidators()
    }, {
      model: vm.phone7841,
      key: 'enabled',
      type: 'checkbox',
      className: 'pull-left medium-5 medium-offset-1',
      templateOptions: {
        label: $translate.instant('trialModal.call.phone7841'),
        id: 'phone7841',
        labelClass: 'medium-offset-1',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.canAddCallDevice;
        }
      },
      watcher: _checkWatcher(),
      validators: _checkValidators()
    }, {
      model: vm.phone7841,
      key: 'quantity',
      type: 'input',
      className: 'pull-left medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'pull-left medium-6 text-right',
        inputClass: 'pull-left medium-5 medium-offset-1 ui--mt-',
        type: 'number',
        max: 5,
        min: 1,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },
      validation: {
        show: true
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.phone7841.enabled;
        },
        'templateOptions.disabled': function () {
          return !vm.phone7841.enabled || vm.phone7841.readonly;
        },
        'model.quantity': function () {
          return vm.getQuantityInputDefault(vm.phone7841, 1);
        }
      },
      watcher: _addWatcher(),
      validators: _addPhonesValidators()
    }];

    vm.shippingFields = [{
      model: vm.shippingInfo,
      key: 'name',
      type: 'input',
      className: 'pull-left medium-8 with-slim-offset',
      templateOptions: {
        labelClass: '',
        inputClass: '',
        label: $translate.instant('trialModal.call.name'),
        type: 'text',
        required: true,
        disabled: true
      },
    }, {
      model: vm.shippingInfo,
      key: 'phoneNumber',
      type: 'input',
      className: 'pull-left medium-4 with-slim-offset offset-l',
      templateOptions: {
        labelClass: '',
        inputClass: '',
        label: $translate.instant('trialModal.call.phone'),
        type: 'text',
        required: true,
        disabled: true
      }
    }, {
      model: vm.shippingInfo,
      key: 'country',
      type: 'select',
      defaultValue: _.find(TrialDeviceService.getCountries(), {
        country: vm.shippingInfo.country
      }),
      className: '',
      templateOptions: {
        labelClass: '',
        inputClass: '',
        label: $translate.instant('trialModal.call.country'),
        type: 'text',
        required: true,
        labelfield: 'country',
        labelProp: 'country',
        valueProp: 'country',
        disabled: true
      },
      expressionProperties: {
        'templateOptions.options': function () {
          return _.map(TrialDeviceService.getCountries(), 'country');
        }
      }
    }, {
      model: vm.shippingInfo,
      key: 'addressLine1',
      type: 'input',
      className: '',
      templateOptions: {
        labelClass: '',
        inputClass: '',
        label: $translate.instant('trialModal.call.address'),
        type: 'text',
        required: true,
        disabled: true
      }
    }, {
      model: vm.shippingInfo,
      key: 'city',
      type: 'input',
      className: '',
      templateOptions: {
        labelClass: '',
        inputClass: '',
        label: $translate.instant('trialModal.call.city'),
        type: 'text',
        required: true,
        disabled: true
      },
    }, {
      model: vm.shippingInfo,
      key: 'state',
      type: 'select',
      defaultValue: _.find(TrialDeviceService.getStates(), {
        country: vm.shippingInfo.state
      }),
      className: 'pull-left medium-8 with-slim-offset',
      templateOptions: {
        labelClass: '',
        inputClass: '',
        label: $translate.instant('trialModal.call.state'),
        required: true,
        disabled: true,
        labelfield: 'abbr',
        valuefield: 'abbr',
        labelProp: 'abbr',
        valueProp: 'state'

      },
      expressionProperties: {
        'templateOptions.options': function () {
          return _.map(TrialDeviceService.getStates(), 'abbr');
        }
      }
    }, {
      model: vm.shippingInfo,
      key: 'postalCode',
      type: 'input',
      className: 'pull-left medium-4 with-slim-offset offset-l',
      validators: _checkValidators(),
      templateOptions: {
        labelClass: '',
        inputClass: '',
        label: $translate.instant('trialModal.call.zip'),
        type: 'text',
        max: 99999,
        min: 0,
        pattern: '\\d{5}',
        required: true,
        disabled: true
      }
    }, {
      model: vm.shippingInfo,
      key: 'dealId',
      type: 'input',
      className: '',
      templateOptions: {
        labelClass: '',
        inputClass: '',
        label: $translate.instant('trialModal.call.dealId'),
        type: 'text',
        required: false,
        disabled: true
      },
    }];

    init();

    ////////////////

    function init() {
      var limitsPromise = TrialDeviceService.getLimitsPromise();
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
    }

    function notifyLimits() {
      var remainingTrials = vm.maxTrials - vm.activeTrials;
      if (_.inRange(remainingTrials, 1, 4)) {
        Notification.warning('trialModal.call.remainingDeviceTrials', {
          number: remainingTrials
        });
      }
    }

    function skip(skipped) {
      _trialDeviceData.skipDevices = skipped;
    }

    function validateInputQuantity($viewValue, $modelValue, scope) {
      var quantity = $modelValue || $viewValue;
      var device = scope.model;
      if (!device.enabled) {
        return true;
      } else {
        return (quantity >= 1 && quantity <= 5);
      }
    }

    function validateRoomSystemsQuantity($viewValue, $modelValue, scope) {
      return _validateTypeQuantity(scope, _trialRoomSystemData.details.roomSystems);

    }

    function validatePhonesQuantity($viewValue, $modelValue, scope) {
      return _validateTypeQuantity(scope, _trialCallData.details.phones);
    }

    function validateTotalQuantity($viewValue, $modelValue, scope) {
      var quantity = calcRelativeQuantity(_trialRoomSystemData.details.roomSystems, _trialCallData.details.phones);
      var device = scope.model;
      if (!device.enabled) {
        return true;
      } else {
        return !(quantity < 2 || quantity > 7);
      }
    }

    function calcRelativeQuantity() {
      var devicesValue = _(Array.prototype.slice.call(arguments))
        .flatten()
        .value();
      var storedQuantity = vm.calcQuantity(_.filter(devicesValue, {
        readonly: true
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
          enabled: true
        })
        .map('quantity')
        .reduce(_.add) || 0;
    }

    function _getQuantityInputDefault(device, defaultValue) {

      var disabled = !device.enabled;
      if (disabled) {
        return 0;
      } else if (device.quantity === 0) {
        return defaultValue;
      } else {
        return device.quantity;
      }
    }

    function _validateTypeQuantity(scope, deviceType) {
      var quantity = vm.calcQuantity(deviceType);
      var device = scope.model;
      if (!device.enabled) {
        return true;
      } else {
        return !(quantity < 2 || quantity > 5);
      }
    }

    function _addWatcher() {
      return {
        expression: function () {
          return vm.calcQuantity(_trialRoomSystemData.details.roomSystems, _trialCallData.details.phones);
        },
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.formControl.$validate();
          }
        }
      };
    }

    function _addRoomSystemValidators() {
      return {
        inputQuantity: {
          expression: vm.validateInputQuantity,
          message: function () {
            return $translate.instant('trialModal.call.invalidQuantity');
          }
        },
        roomSystemsQuantity: {
          expression: vm.validateRoomSystemsQuantity,
          message: function () {
            return $translate.instant('trialModal.call.invalidRoomSystemsQuantity');
          }
        },
        totalQuantity: {
          expression: vm.validateTotalQuantity,
          message: function () {
            return $translate.instant('trialModal.call.invalidTotalQuantity');
          }
        }
      };
    }

    function _addPhonesValidators() {
      return {
        inputQuantity: {
          expression: vm.validateInputQuantity,
          message: function () {
            return $translate.instant('trialModal.call.invalidQuantity');
          }
        },
        phonesQuantity: {
          expression: vm.validatePhonesQuantity,
          message: function () {
            return $translate.instant('trialModal.call.invalidPhonesQuantity');
          }
        },
        totalQuantity: {
          expression: vm.validateTotalQuantity,
          message: function () {
            return $translate.instant('trialModal.call.invalidTotalQuantity');
          }
        }
      };
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
        model: deviceModel.model
      }), 'quantity', 0);
    }

    function toggleShipFields() {
      var quantity = calcRelativeQuantity(_trialRoomSystemData.details.roomSystems, _trialCallData.details.phones);
      var invalidDeviceQuantity = quantity < 2 || quantity > 7;
      var invalidPhoneQuantity = _(_trialCallData.details.phones)
        .flatten()
        .pluck('quantity')
        .some(function (quantity) {
          return quantity > 5;
        });
      var invalidRoomQuantity = calcQuantity(_trialRoomSystemData.details.roomSystems) > 5;

      _.forEach(vm.shippingFields, function (field) {

        field.templateOptions.disabled = invalidDeviceQuantity || invalidRoomQuantity || invalidPhoneQuantity;
        if (field.templateOptions.disabled && field.formControl) {
          field.formControl.$setViewValue('');
        }
      });
    }

    function disabledChecks() {
      return !_.chain(_trialCallData.details.phones)
        .concat(_trialRoomSystemData.details.roomSystems)
        .flatten()
        .filter({
          enabled: true
        })
        .isEmpty().value();
    }

    function validateChecks($viewValue, $modelValue, scope) {
      return _.get(scope, 'model.valid', disabledChecks());
    }

    function _checkValidators() {
      return {
        checkbox: {
          expression: vm.validateChecks
        }
      };
    }

    function _checkWatcher() {
      return {
        expression: vm.toggleShipFields,
        listener: function () {
          return disabledChecks();
        }
      };
    }

    function hasExistingDevices() {
      var devices = _.get($stateParams, 'details.details.devices');
      return !_.every(devices, {
        quantity: 0
      });
    }
  }
})();
