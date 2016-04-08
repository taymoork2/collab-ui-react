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

    if (_.get(_trialDeviceData, 'shippingInfo.country') === '') {
      // always default to USA
      _trialDeviceData.shippingInfo.country = 'United States';
      if (_.has($stateParams, 'details.details.shippingInformation.country')) {
        // nothing was supplied to us and we have something from the backend
        _trialDeviceData.shippingInfo = $stateParams.details.details.shippingInformation;
      }
    }
    vm.shippingInfo = _trialDeviceData.shippingInfo;

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
      className: 'columns medium-6 pad-top',
      templateOptions: {
        label: $translate.instant('trialModal.call.sx10'),
        id: 'cameraSX10',
        class: 'columns medium-offset-1',
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
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-4 medium-offset-2',
        inputClass: 'columns medium-6',
        type: 'number',
        max: 5,
        min: 0,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },

      expressionProperties: {
        'templateOptions.required': function () {
          return vm.sx10.enabled;
        },
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          var disabled = !vm.sx10.enabled;
          if (disabled) {
            scope.model.quantity = 0;
          }
          return disabled || vm.sx10.readonly;
        }
      },
      watcher: _addWatcher(),
      validators: _addRoomSystemValidators()
    }];

    vm.deskPhoneFields = [{
      model: vm.phone8865,
      key: 'enabled',
      type: 'checkbox',
      className: 'columns medium-6 pad-top',
      templateOptions: {
        label: $translate.instant('trialModal.call.phone8865'),
        id: 'phone8865',
        class: 'columns medium-offset-1',
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
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-4 medium-offset-2',
        inputClass: 'columns medium-6',
        type: 'number',
        max: 5,
        min: 0,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.phone8865.enabled;
        },
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          var disabled = !vm.phone8865.enabled;
          if (disabled) {
            scope.model.quantity = 0;
          }
          return disabled || vm.phone8865.readonly;
        }
      },
      watcher: _addWatcher(),
      validators: _addPhonesValidators()
    }, {
      model: vm.phone8845,
      key: 'enabled',
      type: 'checkbox',
      className: 'columns medium-6 pad-top',
      templateOptions: {
        label: $translate.instant('trialModal.call.phone8845'),
        id: 'phone8845',
        class: 'columns medium-offset-1',
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
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-4 medium-offset-2',
        inputClass: 'columns medium-6',
        type: 'number',
        max: 5,
        min: 0,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.phone8845.enabled;
        },
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          var disabled = !vm.phone8845.enabled;
          if (disabled) {
            scope.model.quantity = 0;
          }
          return disabled || vm.phone8845.readonly;
        }
      },
      watcher: _addWatcher(),
      validators: _addPhonesValidators()
    }, {
      model: vm.phone8841,
      key: 'enabled',
      type: 'checkbox',
      className: 'columns medium-6 pad-top',
      templateOptions: {
        label: $translate.instant('trialModal.call.phone8841'),
        id: 'phone8841',
        class: 'columns medium-offset-1'
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
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-4 medium-offset-2',
        inputClass: 'columns medium-6',
        type: 'number',
        max: 5,
        min: 0,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.phone8841.enabled;
        },
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          var disabled = !vm.phone8841.enabled;
          if (disabled) {
            scope.model.quantity = 0;
          }
          return disabled || vm.phone8841.readonly;
        }
      },
      watcher: _addWatcher(),
      validators: _addPhonesValidators()
    }, {
      model: vm.phone7841,
      key: 'enabled',
      type: 'checkbox',
      className: 'columns medium-6 pad-top',
      templateOptions: {
        label: $translate.instant('trialModal.call.phone7841'),
        id: 'phone7841',
        class: 'columns medium-offset-1'
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
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-4 medium-offset-2',
        inputClass: 'columns medium-6',
        type: 'number',
        max: 5,
        min: 0,
        disabled: true,
      },
      modelOptions: {
        allowInvalid: true
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.phone7841.enabled;
        },
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          var disabled = !vm.phone7841.enabled;
          if (disabled) {
            scope.model.quantity = 0;
          }
          return disabled || vm.phone7841.readonly;
        }
      },
      watcher: _addWatcher(),
      validators: _addPhonesValidators()
    }];

    vm.shippingFields = [{
      model: vm.shippingInfo,
      key: 'name',
      type: 'input',
      className: 'columns medium-12',
      templateOptions: {
        labelClass: 'columns medium-2 text-right',
        inputClass: 'columns medium-7',
        label: $translate.instant('trialModal.call.name'),
        type: 'text',
        disabled: true
      },
    }, {
      model: vm.shippingInfo,
      key: 'phoneNumber',
      type: 'input',
      className: 'columns medium-12',
      templateOptions: {
        labelClass: 'columns medium-2 text-right',
        inputClass: 'columns medium-7',
        label: $translate.instant('trialModal.call.phone'),
        type: 'text',
        disabled: true
      }
    }, {
      model: vm.shippingInfo,
      key: 'country',
      type: 'select',
      defaultValue: _.find(TrialDeviceService.getCountries(), {
        country: vm.shippingInfo.country
      }),
      className: 'columns medium-12',
      templateOptions: {
        labelClass: 'columns medium-2 text-right',
        inputClass: 'columns medium-7',
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
          return TrialDeviceService.getCountries();
        }
      }
    }, {
      model: vm.shippingInfo,
      key: 'addressLine1',
      type: 'input',
      className: 'columns medium-12',
      templateOptions: {
        labelClass: 'columns medium-2 text-right',
        inputClass: 'columns medium-7',
        label: $translate.instant('trialModal.call.address'),
        type: 'text',
        required: true,
        disabled: true
      }
    }, {
      model: vm.shippingInfo,
      key: 'city',
      type: 'input',
      className: 'columns medium-12',
      templateOptions: {
        labelClass: 'columns medium-2 text-right',
        inputClass: 'columns medium-7',
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
      className: 'columns medium-5',
      templateOptions: {
        labelClass: 'columns medium-5 text-right',
        inputClass: 'columns medium-6',
        label: $translate.instant('trialModal.call.state'),
        required: true,
        labelfield: 'abbr',
        labelProp: 'abbr',
        valueProp: 'state',
        disabled: true
      },
      expressionProperties: {
        'templateOptions.options': function () {
          return TrialDeviceService.getStates();
        }
      }
    }, {
      model: vm.shippingInfo,
      key: 'postalCode',
      type: 'input',
      className: 'columns medium-6',
      templateOptions: {
        labelClass: 'columns medium-2 medium-offset-1 text-right',
        inputClass: 'columns medium-5',
        label: $translate.instant('trialModal.call.zip'),
        type: 'text',
        max: 99999,
        min: 0,
        pattern: '\\d{5}',
        required: true,
        disabled: true
      }
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
      var quantity = vm.calcQuantity(_trialRoomSystemData.details.roomSystems);
      var device = scope.model;
      if (!device.enabled) {
        return true;
      } else {
        return !(quantity > 5);
      }
    }

    function validatePhonesQuantity($viewValue, $modelValue, scope) {
      var quantity = vm.calcQuantity(_trialCallData.details.phones);
      var device = scope.model;
      if (!device.enabled) {
        return true;
      } else {
        return !(quantity > 5);
      }
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

    function _addWatcher() {
      return {
        expression: function () {
          return vm.calcQuantity(_trialRoomSystemData.details.roomSystems, _trialCallData.details.phones);
        },
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            // trigger validation when quantity has changed
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
      var invalidPhoneQuantity = !(_(_trialCallData.details.phones).flatten()
        .pluck('quantity')
        .filter(function (quantity) {
          return quantity > 5;
        })
        .isEmpty());
      var invalidRoomQuantity = calcQuantity(_trialRoomSystemData.details.roomSystems) > 5;

      _.forEach(vm.shippingFields, function (field) {
        field.templateOptions.disabled = invalidDeviceQuantity || invalidRoomQuantity || invalidPhoneQuantity;
      });
    }

    function disabledChecks() {
      return !_.chain(_trialCallData.details.phones)
        .concat(_trialRoomSystemData.details.roomSystems)
        .flatten()
        .filter({
          enabled: true
        })
        .isEmpty();
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
