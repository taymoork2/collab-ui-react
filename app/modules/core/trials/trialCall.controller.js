(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialCallCtrl', TrialCallCtrl);

  /* @ngInject */
  function TrialCallCtrl($translate, TrialCallService, TrialRoomSystemService) {
    var vm = this;

    var _trialData = TrialCallService.getData();
    var _trialRoomSystemData = TrialRoomSystemService.getData();

    vm.details = _trialData.details;
    vm.hasCallTrial = _trialData.enabled;
    vm.hasRoomSystemTrial = _trialRoomSystemData.enabled;
    vm.validateInputQuantity = validateInputQuantity;
    vm.validateRoomSystemsQuantity = validateRoomSystemsQuantity;
    vm.validatePhonesQuantity = validatePhonesQuantity;
    vm.validateTotalQuantity = validateTotalQuantity;
    vm.calcQuantity = calcQuantity;
    vm.skip = skip;

    vm.sx10 = _.find(vm.details.roomSystems, {
      model: 'CISCO_SX10'
    });
    vm.phone8865 = _.find(vm.details.phones, {
      model: 'CISCO_8865'
    });
    vm.phone8845 = _.find(vm.details.phones, {
      model: 'CISCO_8845'
    });
    vm.phone8841 = _.find(vm.details.phones, {
      model: 'CISCO_8841'
    });
    vm.phone7841 = _.find(vm.details.phones, {
      model: 'CISCO_7841'
    });
    vm.shippingInfo = _.find(vm.details.shippingInfo, {
      isPrimary: true
    });

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
          return !vm.hasRoomSystemTrial;
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
        labelClass: 'columns medium-4',
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
          return disabled;
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
          return !vm.hasCallTrial;
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
        labelClass: 'columns medium-4',
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
          return disabled;
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
          return !vm.hasCallTrial;
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
        labelClass: 'columns medium-4',
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
          return disabled;
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
          return !vm.hasCallTrial;
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
        labelClass: 'columns medium-4',
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
          return disabled;
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
          return !vm.hasCallTrial;
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
        labelClass: 'columns medium-4',
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
          return disabled;
        }
      },
      watcher: _addWatcher(),
      validators: _addPhonesValidators()
    }];

    vm.shippingFields = [{
      key: 'name',
      type: 'input',
      className: 'columns medium-7 pad-top',
      templateOptions: {
        labelClass: 'columns medium-2',
        inputClass: 'columns medium-10',
        label: $translate.instant('trialModal.call.name'),
        type: 'text',
      },
    }, {
      key: 'phoneNumber',
      type: 'input',
      className: 'columns medium-5 pad-top',
      templateOptions: {
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-9',
        label: $translate.instant('trialModal.call.phone'),
      },
    }, {
      key: 'country',
      type: 'select',
      defaultValue: _.find(TrialCallService.getCountryList(), {
        code: 'USA'
      }),
      className: 'columns medium-12 pad-top',
      templateOptions: {
        labelClass: 'columns medium-2',
        inputClass: 'columns medium-10',
        label: $translate.instant('trialModal.call.country'),
        type: 'text',
        required: true,
        labelfield: 'country',
        labelProp: 'country',
        valueProp: 'code',
      },
      expressionProperties: {
        'templateOptions.options': function () {
          return TrialCallService.getCountryList();
        },
      },
    }, {
      key: 'addressLine1',
      type: 'input',
      className: 'columns medium-12 pad-top',
      templateOptions: {
        labelClass: 'columns medium-2',
        inputClass: 'columns medium-10',
        label: $translate.instant('trialModal.call.address'),
        type: 'text',
        required: true,
      },
    }, {
      key: 'city',
      type: 'input',
      className: 'columns medium-4 pad-top',
      templateOptions: {
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-9',
        label: $translate.instant('trialModal.call.city'),
        type: 'text',
        required: true,
      },
    }, {
      key: 'state',
      type: 'select',
      className: 'columns medium-4 pad-top',
      templateOptions: {
        labelClass: 'columns medium-4',
        inputClass: 'columns medium-8',
        label: $translate.instant('trialModal.call.state'),
        type: 'text',
        required: true,
        labelfield: 'abbr',
        labelProp: 'abbr',
        valueProp: 'state',
      },
      expressionProperties: {
        'templateOptions.options': function () {
          return TrialCallService.getStateList();
        }
      },
    }, {
      key: 'postalCode',
      type: 'input',
      className: 'columns medium-4 pad-top',
      templateOptions: {
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-9',
        label: $translate.instant('trialModal.call.zip'),
        type: 'number',
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
      _trialData.skipDevices = skipped;
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
  }
})();
