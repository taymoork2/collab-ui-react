(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryController($state, $interval, $window, $scope, $translate, EdiscoveryService) {
    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant("ediscovery.browserTabHeaderTitle");
    });
    var vm = this;

    vm.deleteReports = deleteReports;
    vm.readingReports = true;
    vm.concat = false;
    vm.moreReports = false;

    $scope.downloadable = downloadable;
    $scope.downloadReport = EdiscoveryService.downloadReport;
    $scope.prettyPrintBytes = EdiscoveryService.prettyPrintBytes;
    $scope.cancable = cancable;
    $scope.cancelReport = cancelReport;
    $scope.rerunReport = rerunReport;
    $scope.oldOffset = 0;
    $scope.offset = 0;
    $scope.limit = 10;

    //var avalonPoller = $timeout(pollAvalonReport, 0);
    var avalonPoller = $interval(pollAvalonReport, 5000);

    $scope.$on('$destroy', function () {
      //$timeout.cancel(avalonPoller);
      $interval.cancel(avalonPoller);
    });

    vm.reports = [];

    //grantNotification();
    pollAvalonReport();

    function cancable(id) {
      var r = findReportById(id);
      return r && (r.state === "RUNNING" || r.timeoutDetected);
    }

    function cancelReport(id) {
      EdiscoveryService.patchReport(id, {
        state: "ABORTED"
      }).then(function (res) {
        pollAvalonReport();
      });
    }

    function downloadable(id) {
      var r = findReportById(id);
      return r && r.state === "COMPLETED";
    }

    function findReportById(id) {
      return _.find(vm.reports, function (report) {
        return report.id === id;
      });
    }

    vm.gridOptions = {
      data: 'ediscoveryCtrl.reports',
      multiSelect: false,
      enableRowSelection: true,
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
          $interval.cancel(avalonPoller);
          if (vm.moreReports) {
            $scope.offset = $scope.offset + $scope.limit;
            vm.concat = true;
            pollAvalonReport();
          }
        });
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (row.entity.state != 'COMPLETED' && row.entity.state != 'FAILED' && row.entity.state != 'ABORTED') {
            EdiscoveryService.getReport(row.entity.id).then(function (report) {
              row.entity = report;
            });
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
        field: 'createdTime',
        displayName: $translate.instant("ediscovery.reportsList.createdAt"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-createdTime.html',
        width: '*'
      }, {
        field: 'roomQuery.roomId',
        displayName: $translate.instant("ediscovery.reportsList.roomId"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-room-id.html',
        width: '*'
      }, {
        field: 'roomQueryDates',
        displayName: $translate.instant("ediscovery.reportsList.dateRange"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-query-from-to-dates.html',
        width: '*'
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
        width: '85'
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

    function grantNotification() {
      if ($window.Notification) {
        $window.Notification.requestPermission().then(function (result) {});
      }
    }

    function rerunReport(report) {
      $state.go('ediscovery.search', {
        report: report,
        reRun: true
      });
    }

    function notifyOnEvent(reports) {
      if (!$window.Notification || $window.Notification.permission != 'granted') {
        return;
      }
      var completedReports = _.filter(reports, function (r) {
        return r.state == 'COMPLETED';
      });
      if (completedReports && completedReports.length > 0) {
        var options = {
          body: 'You have ' + completedReports.length + ' completed reports',
          icon: 'images/cisco_logo.png',
          tag: 'ediscovery'
        };
        var n = new $window.Notification('eDiscovery Dashboard', options);
        setTimeout(n.close.bind(n), 3000);
      }
    }
  }

  angular
    .module('Ediscovery')
    .controller('EdiscoveryController', EdiscoveryController);
}());
