(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('CbgsCtrl', CbgsCtrl);

  /* @ngInject */
  function CbgsCtrl($stateParams, $scope, $timeout, $rootScope, $translate, $filter, $state, Notification, cbgService, gemService) {
    var vm = this;
    vm.searchStr = '';
    vm.gridRefresh = true;
    vm.onRequest = onRequest;
    vm.exportLoading = false;
    vm.exportCSV = exportCSV;
    vm.filterList = filterList;
    vm.customerId = _.get($stateParams, 'customerId', '');
    vm.companyName = _.get($stateParams, 'companyName', '');
    vm.placeholder = $translate.instant('gemini.cbgs.placeholder-text');

    var columnDefs = [{
      width: '30%',
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
      displayName: $translate.instant('gemini.cbgs.field.totalSites'),
    }, {
      width: '12%',
      field: 'status',
      displayName: $translate.instant('gemini.cbgs.field.status_'),
      cellTemplate: require('modules/gemini/callbackGroup/cbgsStatus.tpl.html'),
    }, {
      field: 'customerAttribute',
      cellTooltip: true,
      displayName: $translate.instant('gemini.cbgs.field.alias'),
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
      },
    };

    $scope.gridData = [];
    $scope.gridData_ = []; // for search
    $scope.showCbgDetails = showCbgDetails;
    init();
    function init() {
      initParameters();
      var deregister = $rootScope.$on('cbgsUpdate', function () {
        getcbgs();
      });
      $scope.$on('$destroy', deregister);
      $scope.$emit('headerTitle', $stateParams.companyName);
    }

    function initParameters() {
      if (!vm.customerId) {
        vm.customerId = gemService.getStorage('gmCustomerId');
        vm.companyName = gemService.getStorage('gmCompanyName');
        $state.go('gem.base.cbgs', { companyName: vm.companyName, customerId: vm.customerId });
        return;
      }

      vm.customerId = vm.customerId && gemService.setStorage('gmCustomerId', vm.customerId);
      vm.companyName = vm.companyName && gemService.setStorage('gmCompanyName', vm.companyName);
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
      if (!_.size($scope.gridData_)) {
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
        cbgs: $scope.gridData_,
      };
      $state.go('gemCbgDetails', { info: info });
    }

    function exportCSV() {
      vm.exportLoading = true;
      return cbgService.cbgsExportCSV(vm.customerId).then(function (res) {
        Notification.success('gemini.cbgs.export.result.success');
        return res;
      }).catch(function (res) {
        Notification.errorResponse(res, 'gemini.cbgs.export.result.failed');
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
          $scope.gridData = res;
          $scope.gridData_ = res;
          _.forEach($scope.gridData, function (row) {
            row.groupName = (row.groupName ? row.groupName : row.customerName);
            row.status_ = (row.status ? $translate.instant('gemini.cbgs.field.status.' + row.status) : '');
            row.totalSites = _.size(row.callbackGroupSites);
          });
          vm.isDownload = !!_.size(res);
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        }).finally(function () {
          vm.gridRefresh = false;
        });
    }
  }
})();
