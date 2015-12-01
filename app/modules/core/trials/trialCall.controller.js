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
    vm.sx10 = vm.details.cameras.sx10;
    vm.phone8865 = vm.details.phones.phone8865;
    vm.phone8845 = vm.details.phones.phone8845;
    vm.phone7861 = vm.details.phones.phone7861;
    vm.phone7841 = vm.details.phones.phone7841;
    vm.shippingInfo = vm.details.shippingInfo;

    vm.cameraFields = [{
      model: vm.sx10,
      key: 'enabled',
      type: 'checkbox',
      className: "columns small-6",
      templateOptions: {
        label: $translate.instant('trialModal.call.sx10'),
        id: 'cameraSX10',
        class: 'columns small-offset-1',
      },
    }, {
      model: vm.sx10,
      key: 'quantity',
      type: 'input',
      className: "columns small-6",
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns small-4',
        inputClass: 'columns small-4',
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
      className: "columns small-6",
      templateOptions: {
        label: $translate.instant('trialModal.call.phone8865'),
        id: 'phone8865',
        class: 'columns small-offset-1',
      },
    }, {
      model: vm.phone8865,
      key: 'quantity',
      type: 'input',
      className: "columns small-6",
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns small-4',
        inputClass: 'columns small-4',
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
      className: "columns small-6",
      templateOptions: {
        label: $translate.instant('trialModal.call.phone8845'),
        id: 'phone8845',
        class: 'columns small-offset-1',
      },
    }, {
      model: vm.phone8845,
      key: 'quantity',
      type: 'input',
      className: "columns small-6",
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns small-4',
        inputClass: 'columns small-4',
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
      model: vm.phone7861,
      key: 'enabled',
      type: 'checkbox',
      className: "columns small-6",
      templateOptions: {
        label: $translate.instant('trialModal.call.phone7861'),
        id: 'phone7861',
        class: 'columns small-offset-1',
      },
    }, {
      model: vm.phone7861,
      key: 'quantity',
      type: 'input',
      className: "columns small-6",
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns small-4',
        inputClass: 'columns small-4',
        type: 'number',
        min: 0,
        disabled: true,
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.phone7861.enabled;
        }
      },
    }, {
      model: vm.phone7841,
      key: 'enabled',
      type: 'checkbox',
      className: "columns small-6",
      templateOptions: {
        label: $translate.instant('trialModal.call.phone7841'),
        id: 'phone7841',
        class: 'columns small-offset-1',
      },
    }, {
      model: vm.phone7841,
      key: 'quantity',
      type: 'input',
      className: "columns small-6",
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.call.quantity'),
        labelClass: 'columns small-4',
        inputClass: 'columns small-4',
        type: 'number',
        mind: 0,
        disabled: true,
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.phone7841.enabled;
        }
      },

    }];

    vm.shippingFields = [{
      model: vm.details,
      key: 'address',
      type: 'textarea',
      templateOptions: {
        inputClass: 'columns small-6 noresize',
        // labelClass: 'small-4 columns',
        placeholder: $translate.instant('trialModal.call.address'),
        required: true,
      },
      ngModelAttrs: {
        '{{7}}': {
          value: 'rows'
        }
      },
    }];

    vm.foo = [{
      key: 'country',
      type: 'input',
      templateOptions: {
        labelClass: 'columns small-3',
        inputClass: 'columns small-6',
        label: 'Country',
        type: 'text',
        required: true,
      },
    }, {
      key: 'name',
      type: 'input',
      templateOptions: {
        labelClass: 'columns small-3',
        inputClass: 'columns small-6',
        label: 'Name',
        type: 'text',
      },
    }, {
      key: 'phone',
      type: 'input',
      templateOptions: {
        labelClass: 'columns small-3',
        inputClass: 'columns small-6',
        label: 'Phone',
        type: 'number',
      },
    }, {
      key: 'street',
      type: 'input',
      templateOptions: {
        labelClass: 'columns small-3',
        inputClass: 'columns small-6',
        label: 'Street',
        type: 'text',
        required: true,
      },
    }, {
      key: 'city',
      type: 'input',
      templateOptions: {
        labelClass: 'columns small-3',
        inputClass: 'columns small-4',
        label: 'City',
        type: 'text',
        required: true,
      },
    }, {
      key: 'state',
      type: 'input',
      templateOptions: {
        labelClass: 'columns small-3',
        inputClass: 'columns small-2',
        label: 'State',
        type: 'text',
        required: true,
      },
    }, {
      key: 'zip',
      type: 'input',
      templateOptions: {
        labelClass: 'columns small-3',
        inputClass: 'columns small-2',
        label: 'Zip',
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
