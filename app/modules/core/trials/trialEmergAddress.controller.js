(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialEmergAddressCtrl', TrialEmergAddressCtrl);

  /* @ngInject */
  function TrialEmergAddressCtrl($translate, Notification, PstnServiceAddressService, TerminusStateService, TrialPstnService) {
    var vm = this;

    vm.trial = TrialPstnService.getData();

    vm.addressLoading = true;
    vm.addressFound = false;
    vm.validation = false;

    vm.validateAddress = validateAddress;
    vm.resetAddress = resetAddress;
    vm.skip = skip;

    vm.emergencyAddressFields = [{
      model: vm.trial.details.emergAddr,
      key: 'streetAddress',
      type: 'input',
      className: 'medium-9 inline-row left',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.address'),
        inputClass: 'medium-11'
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return vm.addressFound;
        }
      }
    }, {
      model: vm.trial.details.emergAddr,
      key: 'unit',
      type: 'input',
      className: 'medium-3 inline-row left',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.unit')
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return vm.addressFound;
        }
      }
    }, {
      model: vm.trial.details.emergAddr,
      key: 'city',
      type: 'input',
      className: 'medium-12',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.city'),
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return vm.addressFound;
        }
      }
    }, {
      model: vm.trial.details.emergAddr,
      key: 'state',
      type: 'select',
      className: 'medium-8 inline-row left',
      templateOptions: {
        required: true,
        label: $translate.instant('trialModal.pstn.state'),
        labelfield: 'name',
        valuefield: 'abbreviation',
        inputClass: 'medium-11',
        options: [],
        filter: true
      },
      controller: /* @ngInject */ function ($scope) {
        TerminusStateService.query().$promise.then(function (states) {
          $scope.to.options = states;
        });
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return vm.addressFound;
        }
      }
    }, {
      model: vm.trial.details.emergAddr,
      key: 'zip',
      type: 'input',
      className: 'medium-4 inline-row left',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.zip'),
        onBlur: validateAddress
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return vm.addressFound;
        }
      }
    }];

    function validateAddress() {
      vm.addressLoading = true;
      vm.validation = true;
      return PstnServiceAddressService.lookupAddress({
          streetAddress: vm.trial.details.emergAddr.streetAddress,
          unit: vm.trial.details.emergAddr.unit,
          city: vm.trial.details.emergAddr.city,
          state: vm.trial.details.emergAddr.state.abbreviation,
          zip: vm.trial.details.emergAddr.zip
        })
        .then(function (response) {
          if (angular.isDefined(response)) {
            vm.addressFound = true;
            _.extend(vm.trial.details.emergAddr, response);
          } else {
            vm.validation = false;
            Notification.error('trialModal.pstn.error.noAddress');
          }
        })
        .finally(function () {
          vm.addressLoading = false;
        });
    }

    function skip(skipped) {
      vm.trial.enabled = !skipped;
      vm.trial.skipped = skipped;
    }

    function resetAddress() {
      TrialPstnService.resetAddress();
      vm.validation = false;
      vm.addressFound = false;
    }
  }
})();
