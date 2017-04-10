(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnOrderOverviewCtrl', PstnOrderOverviewCtrl);

  /* @ngInject */
  function PstnOrderOverviewCtrl($stateParams, $translate, PstnSetupService) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    //did order status
    var PENDING = $translate.instant('pstnOrderOverview.inProgress');

    vm.ordersWithDuplicates = [];
    vm.orders = [];

    init();

    function init() {
      PstnSetupService.getFormattedNumberOrders(vm.currentCustomer.customerOrgId).then(function (response) {
        vm.ordersWithDuplicates = response;
        //club all the batches with same OrderId into one Order.
        //V2 Terminus orders API returns different batches for same order as 2 separate orders with different batchID
        vm.orders = condenseOrderBatches();
      });
    }

    function condenseOrderBatches() {
      var finalOrders = [];
      _.forEach(vm.ordersWithDuplicates, function (order) {
        var orderIndex = _.findIndex(finalOrders, { 'carrierOrderId': order.carrierOrderId });
        if (orderIndex == -1) {
          finalOrders.push(order);
        } else {
          finalOrders[orderIndex].numbers = _.concat(finalOrders[orderIndex].numbers, order.numbers);
          // Due to combining the batches with same order compute the final status of the overall order
          // if one of them is pending, set the over all status to pending
          finalOrders[orderIndex].status = order.status === PENDING ? PENDING : finalOrders[orderIndex].status;
        }
      });
      return finalOrders;
    }
  }
})();
