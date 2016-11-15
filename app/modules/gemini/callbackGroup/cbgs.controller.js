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
    vm.filterList = _.debounce(filterList, 350);
    vm.customerId = _.get($stateParams, 'customerId', '');
    vm.placeholder = $translate.instant('gemini.cbgs.placeholder-text');

    $scope.gridData = [];
    $scope.gridData_ = []; // for search
    $scope.showCbgDetails = showCbgDetails;

    $rootScope.$on('cbgsUpdate', function () {
      getcbgs();
    });
    $scope.$emit('headerTitle', $stateParams.companyName);

    var columnDefs = [{
      width: '20%',
      sortable: true,
      field: 'groupName',
      displayName: $translate.instant('gemini.cbgs.field.cbgName'),
      cellTooltip: true,
    }, {
      width: '14%',
      sortable: true,
      field: 'totalSites',
      cellClass: 'text-right',
      headerCellClass: 'align-center',
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

    function filterList(str) {
      vm.searchStr = str;
      getcbgs();
    }

    function getcbgs() {
      vm.gridRefresh = true;

      if ($scope.gridData_.length && vm.searchStr) {
        $scope.gridData = $filter('filter')($scope.gridData_, vm.searchStr);
        vm.gridRefresh = false;
        return;
      }

      cbgService.getCallbackGroups(vm.customerId)
        .then(function (res) {
          var cbgs = res.content.data.body;
          $scope.gridData = cbgs;
          $scope.gridData_ = cbgs;
          _.forEach($scope.gridData, function (row) {
            row.status_ = (row.status ? $translate.instant('gemini.cbgs.field.status.' + row.status) : '');
            row.groupName = (row.groupName ? row.groupName : row.customerName);
          });
          vm.gridRefresh = false;
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status });
          vm.gridRefresh = true;
        });
    }

    function onRequest() {
      $state.go('gem.modal.request', { customerId: vm.customerId });
    }

    function showCbgDetails(cbg) {
      var info = {
        currCbg: cbg,
        customerId: vm.customerId,
        cbgs: $scope.gridData_
      };
      $state.go('gem.cbgDetails', { info: info });
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
    getcbgs();
  }
})();
