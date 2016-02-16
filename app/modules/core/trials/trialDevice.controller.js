(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialDeviceController', TrialDeviceController);

  /* @ngInject */
  function TrialDeviceController($stateParams, $translate, TrialCallService, TrialRoomSystemService, TrialDeviceService) {
    var vm = this;

    var _trialCallData = TrialCallService.getData();
    var _trialRoomSystemData = TrialRoomSystemService.getData();
    var _trialDeviceData = TrialDeviceService.getData();

    vm.details = _.merge(_trialCallData.details, _trialRoomSystemData.details);
    vm.skipDevices = _trialDeviceData.skipDevices;

    vm.canAddCallDevice = TrialCallService.canAddCallDevice(_.get($stateParams, 'details.details'), _trialCallData.enabled);
    vm.canAddRoomSystemDevice = TrialRoomSystemService.canAddRoomSystemDevice(_.get($stateParams, 'details.details'), _trialRoomSystemData.enabled);
    vm.validateInputQuantity = validateInputQuantity;
    vm.validateRoomSystemsQuantity = validateRoomSystemsQuantity;
    vm.validatePhonesQuantity = validatePhonesQuantity;
    vm.validateTotalQuantity = validateTotalQuantity;
    vm.calcQuantity = calcQuantity;
    vm.skip = skip;

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

    setQuantity(vm.sx10);
    setQuantity(vm.phone8865);
    setQuantity(vm.phone8845);
    setQuantity(vm.phone8841);
    setQuantity(vm.phone7841);

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
      }
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
          return disabled || isPreviouslyDisabled(vm.sx10);
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
      }
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
          return disabled || isPreviouslyDisabled(vm.phone8865);
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
      }
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
          return disabled || isPreviouslyDisabled(vm.phone8845);
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
        class: 'columns medium-offset-1',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.canAddCallDevice;
        }
      }
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
          return disabled || isPreviouslyDisabled(vm.phone8841);
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
        class: 'columns medium-offset-1',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.canAddCallDevice;
        }
      }
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
          return disabled || isPreviouslyDisabled(vm.phone7841);
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
        labelClass: 'columns medium-2',
        inputClass: 'columns medium-6',
        label: $translate.instant('trialModal.call.name'),
        type: 'text',
      },
    }, {
      model: vm.shippingInfo,
      key: 'phoneNumber',
      type: 'input',
      className: 'columns medium-12',
      templateOptions: {
        labelClass: 'columns medium-2',
        inputClass: 'columns medium-6',
        label: $translate.instant('trialModal.call.phone'),
        type: 'text'
      },
    }, {
      model: vm.shippingInfo,
      key: 'country',
      type: 'select',
      defaultValue: _.find(TrialDeviceService.getCountries(), {
        country: vm.shippingInfo.country
      }),
      className: 'columns medium-12',
      templateOptions: {
        labelClass: 'columns medium-2',
        inputClass: 'columns medium-6',
        label: $translate.instant('trialModal.call.country'),
        type: 'text',
        required: true,
        labelfield: 'country',
        labelProp: 'country',
        valueProp: 'country',
      },
      expressionProperties: {
        'templateOptions.options': function () {
          return TrialDeviceService.getCountries();
        },
      },
    }, {
      model: vm.shippingInfo,
      key: 'addressLine1',
      type: 'input',
      className: 'columns medium-12',
      templateOptions: {
        labelClass: 'columns medium-2',
        inputClass: 'columns medium-10',
        label: $translate.instant('trialModal.call.address'),
        type: 'text',
        required: true,
      },
    }, {
      model: vm.shippingInfo,
      key: 'city',
      type: 'input',
      className: 'columns medium-4',
      templateOptions: {
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-9',
        label: $translate.instant('trialModal.call.city'),
        type: 'text',
        required: true,
      },
    }, {
      model: vm.shippingInfo,
      key: 'state',
      type: 'select',
      defaultValue: _.find(TrialDeviceService.getStates(), {
        country: vm.shippingInfo.state
      }),
      className: 'columns medium-4',
      templateOptions: {
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-9',
        label: $translate.instant('trialModal.call.state'),
        type: 'text',
        required: true,
        labelfield: 'abbr',
        labelProp: 'abbr',
        valueProp: 'state',
        filter: true
      },
      expressionProperties: {
        'templateOptions.options': function () {
          return TrialDeviceService.getStates();
        }
      },
    }, {
      model: vm.shippingInfo,
      key: 'postalCode',
      type: 'input',
      className: 'columns medium-4',
      templateOptions: {
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-9',
        label: $translate.instant('trialModal.call.zip'),
        type: 'text',
        max: 99999,
        min: 0,
        pattern: '\\d{5}',
        required: true,
      },
    }];

    init();

    ////////////////

    function init() {}

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
      var quantity = vm.calcQuantity(vm.details.roomSystems);
      var device = scope.model;
      if (!device.enabled) {
        return true;
      } else {
        return !(quantity > 5);
      }
    }

    function validatePhonesQuantity($viewValue, $modelValue, scope) {
      var quantity = vm.calcQuantity(vm.details.phones);
      var device = scope.model;
      if (!device.enabled) {
        return true;
      } else {
        return !(quantity > 5);
      }
    }

    function validateTotalQuantity($viewValue, $modelValue, scope) {
      var quantity = vm.calcQuantity(vm.details.roomSystems, vm.details.phones);
      var device = scope.model;
      if (!device.enabled) {
        return true;
      } else {
        return !(quantity < 2 || quantity > 7);
      }
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
          return vm.calcQuantity(vm.details.roomSystems, vm.details.phones);
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
      var quant = getQuantity(deviceModel);
      deviceModel.quantity = quant;
      deviceModel.enabled = !!quant;
    }

    function getQuantity(deviceModel) {
      return _.get(_.find(_.get($stateParams, 'details.details.devices', []), {
        model: deviceModel.model
      }), 'quantity', 0);
    }

    function isPreviouslyDisabled(deviceModel) {
      // get quantity only checks from stateparams, which is gotten from querying trials
      return !!getQuantity(deviceModel);
    }
  }
})();
