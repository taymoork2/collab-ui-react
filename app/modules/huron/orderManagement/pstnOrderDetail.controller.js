(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnOrderDetailCtrl', PstnOrderDetailCtrl);

  /* @ngInject */
  function PstnOrderDetailCtrl($stateParams, $translate, TelephoneNumberService, FeatureToggleService, PstnSetupService) {
    var vm = this;
    vm.currentOrder = $stateParams.currentOrder;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.loading = true;
    vm.allNumbersCount = 0;
    vm.info = [];
    vm.tosAccepted = true;
    var BLOCK_ORDER = 'BLOCK_ORDER';
    var ftHuronSimplifiedTrialFlow = false;

    FeatureToggleService.supports(FeatureToggleService.features.huronSimplifiedTrialFlow).then(function (ftResult) {
      ftHuronSimplifiedTrialFlow = ftResult;
      if (ftHuronSimplifiedTrialFlow) {
        getTOSStatus();
      }
    });

    //parse order
    switch (vm.currentOrder.operation) {
      case BLOCK_ORDER:
        if (_.has(vm.currentOrder, 'numbers')) {
          if (!_.get(vm.currentOrder.numbers, '[0].number')) {
            vm.info.push({
              status: vm.currentOrder.status,
              tooltip: vm.currentOrder.tooltip,
              label: '(' + vm.currentOrder.areaCode + ') XXX-XXXX ' + $translate.instant('pstnSetup.quantity') +
                        ': ' + vm.currentOrder.quantity
            });
          } else {
            pushNumbersToView(vm.currentOrder.numbers);
          }
        }
        break;
      default:
        if (_.has(vm.currentOrder, 'numbers')) {
          pushNumbersToView(vm.currentOrder.numbers);
        }
        break;
    }

    function pushNumbersToView(numbers) {
      _.forEach(numbers, function (num) {
        vm.info.push({
          number: num.number,
          label: TelephoneNumberService.getDIDLabel(num.number),
          status: num.status,
          tooltip: num.tooltip
        });
      });
    }

    function getTOSStatus() {
      PstnSetupService.getCustomerV2(vm.currentCustomer.customerOrgId).then(function (customer) {
        if (customer.trial) {
          PstnSetupService.getCustomerTrialV2(vm.currentCustomer.customerOrgId).then(function (trial) {
            if (!_.has(trial, 'acceptedDate')) {
              vm.tosAccepted = false;
            }
          });
        }
      });
    }

  }
})();
