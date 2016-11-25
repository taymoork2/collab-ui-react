(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('CbgsCtrl', CbgsCtrl);

  /* @ngInject */
  function CbgsCtrl($stateParams, $scope, $timeout, $rootScope, $translate, $filter, $templateCache, $state, Notification, cbgService) {
    var vm = this;
    vm.searchStr = '';
    vm.gridRefresh = true;
    vm.onRequest = onRequest;
    vm.exportLoading = false;
    vm.exportCSV = exportCSV;
    vm.filterList = filterList;
    vm.customerId = _.get($stateParams, 'customerId', '');
    vm.placeholder = $translate.instant('gemini.cbgs.placeholder-text');

    var columnDefs = [{
      width: '20%',
      sortable: true,
      field: 'groupName',
      displayName: $translate.instant('gemini.cbgs.field.cbgName'),
      cellTooltip: true,
    }, {
      width: '18%',
      sortable: true,
      field: 'totalSites',
      cellClass: 'text-right',
      sort: { direction: 'asc', priority: 0 },
      displayName: $translate.instant('gemini.cbgs.field.totalSites')
    }, {
      width: '12%',
      field: 'status',
      displayName: $translate.instant('gemini.cbgs.field.status_'),
      cellTemplate: $templateCache.get('modules/gemini/callbackGroup/cbgsStatus.tpl.html')
    }, {
      field: 'customerAttribute',
      cellTooltip: true,
      displayName: $translate.instant('gemini.cbgs.field.alias')
    }];
    vm.gridOptions = {
      rowHeight: 44,
      data: 'gridData',
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.showCbgDetails(row.entity);
        });
      }
    };

    $scope.gridData = [];
    $scope.gridData_ = []; // for search
    $scope.showCbgDetails = showCbgDetails;
    init();
    function init() {
      $rootScope.$on('cbgsUpdate', function () {
        getcbgs();
      });
      $scope.$emit('headerTitle', $stateParams.companyName);
      getcbgs();
    }

    function filterList(str) {
      var timeout;
      vm.searchStr = str;
      vm.gridRefresh = true;
      $timeout.cancel(timeout); // _.debounce ,it's hard to do unit test, so i replace $timeout;
      $timeout(function () {
        vm.gridRefresh = false;
      }, 350);
      if (!$scope.gridData_.length) {
        return;
      }
      $scope.gridData = $filter('filter')($scope.gridData_, vm.searchStr);
    }

    function onRequest() {
      $state.go('gem.modal.request', { customerId: vm.customerId });
    }

    function showCbgDetails(cbg) {
      var info = {
        groupId: cbg.ccaGroupId,
        customerId: vm.customerId,
        cbgs: $scope.gridData_
      };
      $state.go('gemCbgDetails', { info: info });
    }

    function exportCSV() {
      vm.exportLoading = true;
      return cbgService.cbgsExportCSV(vm.customerId).catch(function (res) {
        Notification.errorResponse(res, 'sure');
      }).finally(function () {
        $timeout(function () {
          vm.exportLoading = false;
        }, 1500);
      });
    }

    function getcbgs() {
      vm.gridRefresh = true;

      cbgService.getCallbackGroups(vm.customerId)
        .then(function (res) {
          var cbgs = _.get(res, 'content.data.body');
          $scope.gridData = cbgs;
          $scope.gridData_ = cbgs;
          _.forEach($scope.gridData, function (row) {
            row.groupName_ = row.groupName; // true groupName
            row.groupName = (row.groupName ? row.groupName : row.customerName);
            row.status_ = (row.status ? $translate.instant('gemini.cbgs.field.status.' + row.status) : '');
          });
          vm.gridRefresh = false;
        })
        .catch(function (err) {
          // TODO will defined the wording
          Notification.errorResponse(err, 'errors.statusError', { status: err.status });
          vm.gridRefresh = true;
        });
    }
  }
})();
