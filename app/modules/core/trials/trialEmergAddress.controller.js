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
      type: 'inline',
      className: 'medium-12 columns no-pad',
      templateOptions: {
        fields: [{
          model: vm.trial.details.emergAddr,
          key: 'streetAddress',
          type: 'input',
          className: 'medium-9 columns no-flex',
          templateOptions: {
            labelfield: 'label',
            label: $translate.instant('trialModal.pstn.address'),
            labelClass: 'columns medium-2 text-right',
            inputClass: 'columns medium-9'
          }
        }, {
          model: vm.trial.details.emergAddr,
          key: 'unit',
          type: 'input',
          className: 'medium-3 columns no-flex',
          templateOptions: {
            labelfield: 'label',
            label: $translate.instant('trialModal.pstn.unit'),
            labelClass: 'columns medium-3 text-right',
            inputClass: 'columns medium-9',

          }
        }]
      }
    }, {
      model: vm.trial.details.emergAddr,
      key: 'city',
      type: 'input',
      className: 'medium-9 columns no-flex no-pad',
      templateOptions: {
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.city'),
        labelClass: 'columns medium-2 text-right',
        inputClass: 'columns medium-9 city-width',
      }
    }, {
      type: 'inline',
      className: 'medium-9 columns no-pad',
      templateOptions: {
        fields: [{
          model: vm.trial.details.emergAddr,
          key: 'state',
          type: 'select',
          className: 'medium-5 columns max-width no-flex',
          templateOptions: {
            label: $translate.instant('trialModal.pstn.state'),
            labelfield: 'abbreviation',
            valuefield: 'abbreviation',
            labelClass: 'columns medium-5 text-right',
            inputClass: 'columns medium-7',
            options: []
          },
          controller: /* @ngInject */ function ($scope) {
            TerminusStateService.query().$promise.then(function (states) {
              $scope.to.options = _.map(states, 'abbreviation');
            });
          }
        }, {
          model: vm.trial.details.emergAddr,
          key: 'zip',
          type: 'input',
          className: 'medium-6 columns no-flex',
          templateOptions: {
            labelfield: 'label',
            label: $translate.instant('trialModal.pstn.zip'),
            labelClass: 'columns medium-6 text-right',
            inputClass: 'columns medium-7',
            onBlur: validateAddress
          }
        }]
      }
    }];

    function validateAddress() {
      vm.validation = true;
      vm.addressLoading = true;
      return PstnServiceAddressService.lookupAddress(vm.trial.details.emergAddr)
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
