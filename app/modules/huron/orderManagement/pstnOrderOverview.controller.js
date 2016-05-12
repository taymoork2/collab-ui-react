(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnOrderOverviewCtrl', PstnOrderOverviewCtrl);

  /* @ngInject */
  function PstnOrderOverviewCtrl($scope, $stateParams, $translate, PstnSetupService) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.orders = [];

    //order types to ignore
    var UPDATE = 'UPDATE';
    var DELETE = 'DELETE';
    var ADD = 'ADD';

    //IP order status
    var PENDING = 'PENDING';
    var PROVISIONED = 'PROVISIONED';

    //IP order type
    var BLOCK_ORDER = 'BLOCK_ORDER';
    var NUMBER_ORDER = 'NUMBER_ORDER';

    //Atlas order status
    var SUCCESSFUL = $translate.instant('pstnOrderOverview.successful');
    var IN_PROGRESS = $translate.instant('pstnOrderOverview.inProgress');

    //Atlas order type
    var ADVANCE_ORDER = $translate.instant('pstnOrderOverview.advanceOrder');
    var NEW_NUMBER_ORDER = $translate.instant('pstnOrderOverview.newNumberOrder');

    getCustomerOrders();

    function getCustomerOrders() {
      PstnSetupService.getAllOrders(vm.currentCustomer.customerOrgId).then(function (response) {
        _.forEach(response, function (order) {
          if (order.operation != UPDATE && order.operation != DELETE && order.operation != ADD) {
            var newOrder = {
              carrierOrderId: _.get(order, 'carrierOrderId'),
              response: _.get(order, 'response'),
              operation: _.get(order, 'operation')
            };
            //translate order status
            if (order.status === PROVISIONED) {
              newOrder.status = SUCCESSFUL;
            } else if (order.status === PENDING) {
              newOrder.status = IN_PROGRESS;
            }

            //translate order type
            if (order.operation === BLOCK_ORDER) {
              newOrder.type = ADVANCE_ORDER;
            } else if (order.operation === NUMBER_ORDER) {
              newOrder.type = NEW_NUMBER_ORDER;
            }

            //translate creation date
            var orderDate = new Date(order.created);
            newOrder.sortDate = orderDate.getTime();
            newOrder.created = orderDate.getMonth() + '/' + orderDate.getDate() + '/' + orderDate.getFullYear();

            vm.orders.push(newOrder);
          }
        });
      });
    }
  }
})();
