(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryController($state, $timeout, $interval, $window, $scope, $translate, $modal, EdiscoveryService) {
    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant("ediscovery.browserTabHeaderTitle");
    });
    var vm = this;

    vm.deleteReports = deleteReports;
    vm.readingReports = true;
    vm.concat = false;
    vm.moreReports = false;

    $scope.prettyPrintBytes = prettyPrintBytes;
    $scope.downloadable = downloadable;
    $scope.downloadReport = EdiscoveryService.downloadReport;
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

    function openGenericModal(title, messages) {
      $modal.open({
        templateUrl: "modules/ediscovery/genericModal.html",
        controller: 'EdiscoveryGenericModalCtrl as modal',
        resolve: {
          title: function () {
            return title;
          },
          messages: function () {
            return messages;
          }
        }
      });
    }

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
      rowHeight: 68,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
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
        cellTemplate: 'modules/ediscovery/cell-template-name.html'
      }, {
        field: 'createdTime',
        displayName: $translate.instant("ediscovery.reportsList.createdAt"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-createdTime.html'
      }, {
        field: 'roomQuery.roomId',
        displayName: $translate.instant("ediscovery.reportsList.roomId"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-room-id.html'
      }, {
        field: 'roomQueryDates',
        displayName: $translate.instant("ediscovery.reportsList.dateRange"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-query-from-to-dates.html'
      }, {
        field: 'state',
        displayName: $translate.instant("ediscovery.reportsList.state"),
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-state.html'
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
        if (paging.next) {
          vm.moreReports = true;
        } else {
          vm.moreReports = false;
        }
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
        //$timeout.cancel(avalonPoller);
        //avalonPoller = $timeout(pollAvalonReport, 5000);
      });
    }

    function grantNotification() {
      if ($window.Notification) {
        $window.Notification.requestPermission().then(function (result) {});
      }
    }

    function rerunReport(roomId, startDate, endDate) {
      $state.go('ediscovery.search', {
        roomId: roomId,
        startDate: startDate,
        endDate: endDate
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

    function prettyPrintBytes(bytes, precision) {
      if (bytes === 0) {
        return '0';
      }
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
        return '-';
      }
      if (typeof precision === 'undefined') {
        precision = 1;
      }

      var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024)),
        val = (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision);

      return (val.match(/\.0*$/) ? val.substr(0, val.indexOf('.')) : val) + ' ' + units[number];
    }
  }

  function EdiscoveryGenericModalCtrl($modalInstance, title, messages) {
    var vm = this;
    vm.messages = $.isArray(messages) ? messages : [messages];
    vm.title = title;
  }

  angular
    .module('Ediscovery')
    .controller('EdiscoveryController', EdiscoveryController)
    .controller('EdiscoveryGenericModalCtrl', EdiscoveryGenericModalCtrl);
}());
