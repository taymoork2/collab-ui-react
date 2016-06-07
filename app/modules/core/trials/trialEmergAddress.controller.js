(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialEmergAddressCtrl', TrialEmergAddressCtrl);

  /* @ngInject */
  function TrialEmergAddressCtrl($translate, Notification, PstnServiceAddressService, TerminusStateService, TrialPstnService) {
    var vm = this;

    vm.trial = TrialPstnService.getData();

    vm.addressLoading = false;
    vm.validation = false;

    vm.validateAddress = validateAddress;
    vm.resetAddress = resetAddress;
    vm.skip = skip;

    vm.emergencyAddressFields = [{
      className: 'inline-row',
      fieldGroup: [{
        model: vm.trial.details.emergAddr,
        key: 'streetAddress',
        type: 'input',
        className: 'medium-9',
        templateOptions: {
          labelfield: 'label',
          label: $translate.instant('trialModal.pstn.address'),
          inputClass: 'medium-11'
        }
      }, {
        model: vm.trial.details.emergAddr,
        key: 'unit',
        type: 'input',
        className: 'medium-3',
        templateOptions: {
          labelfield: 'label',
          label: $translate.instant('trialModal.pstn.unit')
        }
      }]
    }, {
      model: vm.trial.details.emergAddr,
      key: 'city',
      type: 'input',
      className: 'medium-12',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.city'),
      }
    }, {
      className: 'inline-row',
      fieldGroup: [{
        model: vm.trial.details.emergAddr,
        key: 'state',
        type: 'select',
        className: 'medium-8',
        templateOptions: {
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
        }
      }, {
        model: vm.trial.details.emergAddr,
        key: 'zip',
        type: 'input',
        className: 'medium-4',
        templateOptions: {
          labelfield: 'label',
          label: $translate.instant('trialModal.pstn.zip'),
          onBlur: validateAddress
        }
      }]
    }];

    function validateAddress() {
      vm.validation = true;
      vm.addressLoading = true;
      return PstnServiceAddressService.lookupAddress({
          streetAddress: vm.trial.details.emergAddr.streetAddress,
          unit: vm.trial.details.emergAddr.unit,
          city: vm.trial.details.emergAddr.city,
          state: vm.trial.details.emergAddr.state.abbreviation,
          zip: vm.trial.details.emergAddr.zip
        })
        .then(function (response) {
          if (angular.isDefined(response)) {
            _.extend(vm.trial.details.emergAddr, response);
          } else {
            vm.validation = false;
            Notification.error('trialModal.pstn.error.noAddress');
          }
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
    }
  }
})();
