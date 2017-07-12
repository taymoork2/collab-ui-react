require('./_provisioning.scss');


(function () {
  'use strict';

  module.exports = ProvisioningController;

  /* @ngInject */
  function ProvisioningController($scope, $state, $templateCache, $timeout, $translate, ProvisioningService) {
    var vm = this;

    /*
     * Get order data from the api.
     */
    vm.results = getOrderData();

    /*
     * Call the function that filters all the results by status.
     */
    getAndFilterResults();

    /*
     * Define the tabs for the header.
     */
    vm.tabs = [{
      title: $translate.instant('provisioningConsole.tabs.pending'),
      state: 'provisioning.pending',
    }, {
      title: $translate.instant('provisioningConsole.tabs.completed'),
      state: 'provisioning.completed',
    }];

    /*
     * Open the side panel.
     */
    vm.showDetails = function (row) {
      $state.go('order-details', { order: row });
    };

    /*
     * Move an order between pending, in progress and completed.
     */
    vm.moveTo = function (order, category) {
      vm.results = ProvisioningService.updateOrderStatus(order, category);
      getAndFilterResults();
    };

    /*
     * Search for a specific order number.
     * TODO: Hook this up to a Service (Sarah)
     * TODO: Hook the service up to the backend (backend team)
     */
    vm.setCurrentSearch = function (searchStr) {
      if (vm.timer) {
        $timeout.cancel(vm.timer);
        vm.timer = 0;
      }

      vm.timer = $timeout(function () {
        if (searchStr.length >= 3 || searchStr === '') {
          vm.results = getOrderData(searchStr);
          getAndFilterResults();
        }
      }, 500);
    };

    /*
     * Filter all the results and grid options by status.
     */
    function getAndFilterResults() {
      vm.pendingResults = filterOrders(0);
      vm.progressResults = filterOrders(1);
      vm.completedResults = filterOrders(2);
      vm.pendingProgress = _.union(vm.pendingResults, vm.progressResults);
      vm.gridOptions = getGridOptions();
    }

    /*
     * Only return results with a certain status code.
     */
    function filterOrders(status) {
      return _.filter(vm.results, function (res) {
        return parseInt(res.statusCode, 10) === parseInt(status, 10);
      });
    }

    /*
     * Load templates from the template folder.
     */
    function getTemplate(tpl) {
      return $templateCache.get('modules/squared/provisioningConsole/templates/' + tpl + '.html');
    }

    /*
     * Get the data from the API.
     * TODO: Hook the service up to the back-end (back-end team)
     * TODO: If the actual API ends up returning differently formatted data, the back-end team might have to make slight changes to the front-end code to make it match.
     */
    function getOrderData(searchStr) {
      if (searchStr && searchStr.length > 0) {
        return ProvisioningService.searchForOrders();
      } else {
        return ProvisioningService.getOrders();
      }
    }

    /*
     * Get the options for the pending/in progress and completed table.
     */
    function getGridOptions() {
      return {
        pending: {
          data: vm.pendingProgress,
          enableHorizontalScrollbar: 0,
          rowHeight: 45,
          enableRowHeaderSelection: false,
          enableColumnMenus: false,
          multiSelect: false,
          onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
              vm.showDetails(row.entity);
            });
          },
          columnDefs: [{
            field: 'orderNumber',
            displayName: $translate.instant('provisioningConsole.orderNumber'),
          }, {
            field: 'customerName',
            displayName: $translate.instant('provisioningConsole.customerName'),
          }, {
            field: 'customerMail',
            displayName: $translate.instant('provisioningConsole.customerMail'),
          }, {
            field: 'manualTask',
            displayName: $translate.instant('provisioningConsole.manualTask'),
          }, {
            field: 'status',
            displayName: $translate.instant('provisioningConsole.status'),
          }, {
            field: 'received',
            displayName: $translate.instant('provisioningConsole.received'),
          }, {
            field: 'actions',
            displayName: $translate.instant('provisioningConsole.actions'),
            cellTemplate: getTemplate('actions'),
          }],
        },
        completed: {
          data: vm.completedResults,
          enableHorizontalScrollbar: 0,
          rowHeight: 45,
          enableRowHeaderSelection: false,
          enableColumnMenus: false,
          multiSelect: false,
          onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
              vm.showDetails(row.entity);
            });
          },
          columnDefs: [{
            field: 'orderNumber',
            displayName: $translate.instant('provisioningConsole.orderNumber'),
          }, {
            field: 'customerName',
            displayName: $translate.instant('provisioningConsole.customerName'),
          }, {
            field: 'customerMail',
            displayName: $translate.instant('provisioningConsole.customerMail'),
          }, {
            field: 'manualTask',
            displayName: $translate.instant('provisioningConsole.manualTask'),
          }, {
            field: 'status',
            displayName: $translate.instant('provisioningConsole.status'),
          }, {
            field: 'completionDate',
            displayName: $translate.instant('provisioningConsole.completed'),
          }],
        },
      };
    }
  }
}());
