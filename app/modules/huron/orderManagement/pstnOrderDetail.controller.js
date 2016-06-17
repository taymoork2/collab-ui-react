(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnOrderDetailCtrl', PstnOrderDetailCtrl);

  /* @ngInject */
  function PstnOrderDetailCtrl($stateParams, $translate, TelephoneNumberService) {
    var vm = this;
    vm.currentOrder = $stateParams.currentOrder;
    vm.loading = true;
    vm.allNumbersCount = 0;
    vm.info = [];
    var BLOCK_ORDER = 'BLOCK_ORDER';

    //parse order
    switch (vm.currentOrder.operation) {
    case BLOCK_ORDER:
      if (_.has(vm.currentOrder, 'response')) {
        try {
          var order = JSON.parse(vm.currentOrder.response);
          var response = order[vm.currentOrder.carrierOrderId];
        } catch (error) {
          return;
        }
        if (!_.get(response, '[0].e164')) {
          vm.info.push({
            label: $translate.instant('pstnOrderDetail.pendingNumbers', {
              count: response.length
            }, 'messageformat')
          });
        } else {
          pushNumbersToView(response);
        }
      }
      break;
    default:
      if (_.has(vm.currentOrder, 'response')) {
        try {
          var order = JSON.parse(vm.currentOrder.response);
          var response = order[vm.currentOrder.carrierOrderId];
        } catch (error) {
          return;
        }
        pushNumbersToView(response);
      }
      break;
    }

    function pushNumbersToView(order) {
      _.forEach(order, function (number) {
        vm.info.push({
          number: number.e164,
          label: TelephoneNumberService.getDIDLabel(number.e164)
        });
      });
    }
  }
})();
