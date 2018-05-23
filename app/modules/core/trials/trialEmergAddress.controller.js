(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialEmergAddressCtrl', TrialEmergAddressCtrl);

  /* @ngInject */
  function TrialEmergAddressCtrl($scope, $translate, Analytics, Notification, PstnServiceAddressService, TrialPstnService) {
    var vm = this;

    vm.trial = TrialPstnService.getData();
    vm.parentTrialData = $scope.$parent.trialData;

    vm.addressLoading = true;
    vm.addressFound = false;
    vm.validation = false;

    vm.validateAddress = validateAddress;
    vm.resetAddress = resetAddress;
    vm.skip = skip;
    vm.previousStep = previousStep;

    if (!_.isEmpty(vm.trial.details.emergAddr.state)) {
      vm.validation = true;
      vm.addressFound = true;
      vm.addressLoading = false;
    }

    Analytics.trackTrialSteps(Analytics.eventNames.ENTER, vm.parentTrialData);

    function validateAddress() {
      vm.addressLoading = true;
      vm.validation = true;
      return PstnServiceAddressService.lookupAddressV2({
        streetAddress: vm.trial.details.emergAddr.streetAddress,
        unit: vm.trial.details.emergAddr.unit,
        city: vm.trial.details.emergAddr.city,
        state: vm.trial.details.emergAddr.state,
        zip: vm.trial.details.emergAddr.zip,
      }, vm.trial.details.pstnProvider.uuid)
        .then(function (response) {
          if (!_.isUndefined(response)) {
            vm.addressFound = true;
            vm.readOnly = true;
            _.extend(vm.trial.details.emergAddr, response);
          } else {
            vm.validation = false;
            Notification.errorWithTrackingId(response, 'trialModal.pstn.error.noAddress');
            Analytics.trackTrialSteps(Analytics.eventNames.VALIDATION_ERROR, vm.parentTrialData, { value: vm.trial.details.emergAddr, error: $translate.instant('trialModal.pstn.error.noAddress') });
          }
        })
        .finally(function () {
          vm.addressLoading = false;
        });
    }

    function skip(skipped) {
      Analytics.trackTrialSteps(Analytics.eventNames.SKIP, vm.parentTrialData);
      vm.trial.enabled = !skipped;
      vm.trial.skipped = skipped;
    }

    function previousStep() {
      if (!vm.addressFound) {
        TrialPstnService.resetAddress();
      }
      $scope.$parent.trial.previousStep();
    }

    function resetAddress() {
      TrialPstnService.resetAddress();
      vm.validation = false;
      vm.addressFound = false;
      vm.readOnly = false;
    }
  }
})();
