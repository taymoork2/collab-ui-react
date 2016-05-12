(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnOrderDetailCtrl', PstnOrderDetailCtrl);

  /* @ngInject */
  function PstnOrderDetailCtrl($scope, $stateParams, $translate, TelephoneNumberService) {
    var vm = this;
    vm.currentOrder = $stateParams.currentOrder;
    vm.loading = true;
    vm.allNumbersCount = 0;
    vm.info = [];
    var BLOCK_ORDER = 'BLOCK_ORDER';

    //parse order
    switch (vm.currentOrder.operation) {
    case BLOCK_ORDER:
      if (_.get(vm.currentOrder, 'response')) {
        try {
          var order = JSON.parse(vm.currentOrder.response);
        } catch (error) {
          return;
        }
        if (order[vm.currentOrder.carrierOrderId][0].e164 === null) {
          vm.info.push({
            label: $translate.instant('pstnOrderDetail.pendingNumbers', {
              count: order[vm.currentOrder.carrierOrderId].length
            }, 'messageformat')
          });
        } else {
          pushNumbersToView(order[vm.currentOrder.carrierOrderId]);
        }
      }
      break;
    default:
      if (_.get(vm.currentOrder, 'response')) {
        try {
          var order = JSON.parse(vm.currentOrder.response);
        } catch (error) {
          return;
        }
        pushNumbersToView(order[vm.currentOrder.carrierOrderId]);
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
