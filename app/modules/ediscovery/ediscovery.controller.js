(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryController($state, $interval, $window, $scope, $translate, EdiscoveryService, uiGridConstants, EdiscoveryNotificationService, Notification) {
    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant("ediscovery.browserTabHeaderTitle");
    });
    var vm = this;

    vm.deleteReports = deleteReports;
    vm.readingReports = true;
    vm.concat = false;
    vm.moreReports = false;

    $scope.downloadReport = downloadReport;
    $scope.downloadReportId = undefined;
    $scope.prettyPrintBytes = EdiscoveryService.prettyPrintBytes;
    $scope.cancelReport = cancelReport;
    $scope.rerunReport = rerunReport;
    $scope.viewReport = viewReport;
    $scope.oldOffset = 0;
    $scope.offset = 0;
    $scope.limit = 10;
    $scope.reportsBeingCancelled = [];

    var avalonPoller = $interval(pollAvalonReport, 5000);
    var avalonPollerCancelled = false;
    var avalonRefreshPoller = null;

    function cancelAvalonPoller() {
      $interval.cancel(avalonPoller);
      avalonPollerCancelled = true;
    }

    $scope.$on('$destroy', function () {
      $interval.cancel(avalonPoller);
      $interval.cancel(avalonRefreshPoller);
    });

    vm.reports = [];

    pollAvalonReport();

    function downloadReport(report) {
      $scope.downloadReportId = report.id;
      EdiscoveryService.downloadReport(report)
        .catch(function (err) {
          Notification.error($translate.instant("ediscovery.unableToDownloadFile"));
        })
        .finally(function (res) {
          $scope.downloadReportId = undefined;
        });
    }

    function cancelReport(id) {
      if ($scope.reportsBeingCancelled[id]) {
        return;
      }
      $scope.reportsBeingCancelled[id] = true;
      EdiscoveryService.patchReport(id, {
        state: "ABORTED"
      }).then(function (res) {
        if (!EdiscoveryNotificationService.notificationsEnabled()) {
          Notification.success($translate.instant('ediscovery.search.reportCancelled'));
        }
        pollAvalonReport();
      }, function (err) {
        if (err.status !== 410) {
          Notification.error($translate.instant('ediscovery.search.reportCancelFailed'));
        }
      }).finally(function () {
        delete $scope.reportsBeingCancelled[id];
      });
    }

    vm.gridOptions = {
      data: 'ediscoveryCtrl.reports',
      multiSelect: false,
      enableRowSelection: false,
      rowHeight: 50,
      enableRowHeaderSelection: false,
      enableColumnResizing: true,
      enableColumnMenus: false,
      enableHorizontalScrollbar: 0,
      infiniteScrollUp: true,
      infiniteScrollDown: true,
      infiniteScrollRowsFromEnd: 10,
      onRegisterApi: function (gridApi) {
        vm.gridApi = gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          //$interval.cancel(avalonPoller);
          cancelAvalonPoller();
          if (vm.moreReports) {
            $scope.offset = $scope.offset + $scope.limit;
            vm.concat = true;
            pollAvalonReport();
          }
        });
        gridApi.core.on.rowsRendered($scope, function () {
          if (avalonPollerCancelled) {
            if (!avalonRefreshPoller) {
              avalonRefreshPoller = $interval(function () {
                _.each(vm.reports, function (r, index) {
                  if (r.state === 'RUNNING') {
                    EdiscoveryService.getReport(r.id).then(function (updatedReport) {
                      r = updatedReport;
                      vm.reports[index] = updatedReport;
                      gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);
                    });
                  }
                });
              }, 3000);
            }
          }
        });
      },
      columnDefs: [{
        field: 'displayName',
        displayName: $translate.instant("ediscovery.reportsList.name"),
        sortable: true,
        cellTemplate: 'modules/ediscovery/cell-template-name.html',
        width: '*'
      }, {
        field: 'roomQuery.roomId',
        displayName: $translate.instant("ediscovery.reportsList.roomId"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-room-id.html',
        width: '*'
      }, {
        field: 'createdTime',
        displayName: $translate.instant("ediscovery.reportsList.dateGenerated"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-createdTime.html',
        width: '*'
      }, {
        field: 'size',
        displayName: $translate.instant("ediscovery.reportsList.size"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-size.html',
        width: '110'
      }, {
        field: 'state',
        displayName: $translate.instant("ediscovery.reportsList.state"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-state.html',
        width: '*'
      }, {
        field: 'actions',
        displayName: $translate.instant("ediscovery.reportsList.actions"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-action.html',
        width: '160'
      }]
    };

    function deleteReports() {
      EdiscoveryService.deleteReports().then(function (res) {
        pollAvalonReport();
      });
    }

    function pollAvalonReport() {
      EdiscoveryService.getReports($scope.offset, $scope.limit).then(function (res) {
        var reports = res.reports;
        var paging = res.paging;
        vm.moreReports = !!paging.next;
        if (vm.concat) {
          vm.reports = vm.reports.concat(reports);
        } else {
          vm.reports = reports;
        }
        if (vm.gridApi) {
          vm.gridApi.infiniteScroll.dataLoaded(false, true);
        }
      }).finally(function (res) {
        vm.readingReports = false;
      });
    }

    function rerunReport(report) {
      $state.go('ediscovery.search', {
        report: report,
        reRun: true
      });
    }

    function viewReport(report) {
      $state.go('ediscovery.search', {
        report: report
      });
    }
  }

  angular
    .module('Ediscovery')
    .controller('EdiscoveryController', EdiscoveryController);
}());
