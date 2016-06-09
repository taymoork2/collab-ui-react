(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryController($state, $timeout, $window, $scope, $translate, $modal, EdiscoveryService) {
    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant("ediscovery.browserTabHeaderTitle");
    });
    var vm = this;

    vm.deleteReports = deleteReports;

    $scope.prettyPrintBytes = prettyPrintBytes;
    $scope.downloadable = downloadable;
    $scope.downloadReport = downloadReport;
    $scope.cancable = cancable;
    $scope.cancelReport = cancelReport;
    $scope.rerunReport = rerunReport;

    var avalonPoller = $timeout(pollAvalonReport, 0);

    $scope.$on('$destroy', function () {
      $timeout.cancel(avalonPoller);
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

    function downloadReport(id) {
      openGenericModal("Note", "Download not implemented yet!");
    }

    function findReportById(id) {
      return _.find(vm.reports, function (report) {
        return report.id === id;
      });
    }

    vm.gridOptions = {
      data: 'ediscoveryCtrl.reports',
      multiSelect: false,
      rowHeight: 55,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      enableHorizontalScrollbar: 0,

      columnDefs: [{
        field: 'displayName',
        displayName: 'Name',
        sortable: true,
        cellTemplate: 'modules/ediscovery/cell-template-name.html',
        width: '25%'
      }, {
        field: 'createdTime',
        displayName: 'Created At',
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-createdTime.html',
        width: '15%'
      }, {
        field: 'roomQuery.roomId',
        displayName: 'Room Id',
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-room-id.html',
        width: '15%'
      }, {
        field: 'roomQueryDates',
        displayName: 'Activity dates',
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-query-from-to-dates.html',
        width: '15%'
      }, {
        field: 'state',
        displayName: 'State',
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-state.html',
        width: '20%'
      }, {
        field: 'actions',
        displayName: 'Actions',
        sortable: false,
        cellTemplate: 'modules/ediscovery/cell-template-action.html',
        width: '10%'
      }]
    };

    function deleteReports() {
      EdiscoveryService.deleteReports().then(function (res) {
        pollAvalonReport();
      });
    }

    function pollAvalonReport() {
      EdiscoveryService.getReports().then(function (res) {
        vm.reports = res;
      }).finally(function (res) {
        $timeout.cancel(avalonPoller);
        avalonPoller = $timeout(pollAvalonReport, 5000);
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
