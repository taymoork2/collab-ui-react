(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialCallCtrl', TrialCallCtrl);

  /* @ngInject */
  function TrialCallCtrl($translate, TrialCallService) {
    var vm = this;

    var _trialData = TrialCallService.getData();

    vm.details = _trialData.details;
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
    }, {
      model: vm.sx10,
      key: 'quantity',
      type: 'input',
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-5',
        type: 'number',
        min: 0,
        disabled: true,
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.sx10.enabled;
        }
      },
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
    }, {
      model: vm.phone8865,
      key: 'quantity',
      type: 'input',
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-5',
        type: 'number',
        min: 0,
        disabled: true,
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.phone8865.enabled;
        }
      },
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
    }, {
      model: vm.phone8845,
      key: 'quantity',
      type: 'input',
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-5',
        type: 'number',
        min: 0,
        disabled: true,
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.phone8845.enabled;
        }
      },
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
    }, {
      model: vm.phone8841,
      key: 'quantity',
      type: 'input',
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-5',
        type: 'number',
        min: 0,
        disabled: true,
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.phone8841.enabled;
        }
      },
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
    }, {
      model: vm.phone7841,
      key: 'quantity',
      type: 'input',
      className: 'columns medium-6',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns medium-3',
        inputClass: 'columns medium-5',
        type: 'number',
        min: 0,
        disabled: true,
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.phone7841.enabled;
        }
      },
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

  }
})();
