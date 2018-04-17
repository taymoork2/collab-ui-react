require('./ediscovery.scss');
require('@ciscospark/internal-plugin-search');

(function () {
  'use strict';

  module.exports = EdiscoveryReportsController;
  /* @ngInject */
  function EdiscoveryReportsController($interval, $modal, $scope, $state, $translate, $window, Analytics, Authinfo, EdiscoveryService, EdiscoveryNotificationService, Notification, ReportUtilService, uiGridConstants) {
    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant('ediscovery.browserTabHeaderTitle');
    });
    var vm = this;
    var spark;
    var ReportStates = {
      ABORTED: 'ABORTED',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
      RUNNING: 'RUNNING',
    };

    vm.readingReports = true;
    vm.concat = false;
    vm.moreReports = false;
    vm.isReportGenerating = false;

    $scope.downloadReport = downloadReport;
    $scope.prettyPrintBytes = EdiscoveryService.prettyPrintBytes;
    $scope.openCancelReportModal = openCancelReportModal;
    $scope.cancelReport = cancelReport;
    vm.pollAvalonReport = pollAvalonReport;
    $scope.rerunReport = rerunReport;
    $scope.viewReport = viewReport;
    $scope.getKeyTooltip = getKeyTooltip;
    $scope.getKey = getKey;
    $scope.isUserReportCreator = isUserReportCreator;

    $scope.downloadingReportId = undefined;
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
    spark = EdiscoveryService.setupSpark();

    pollAvalonReport();

    function downloadReport(report) {
      $scope.downloadingReportId = report.id;
      EdiscoveryService.downloadReport(report)
        .catch(function () {
          Notification.error('ediscovery.unableToDownloadFile');
        })
        .finally(function () {
          $scope.downloadingReportId = undefined;
          if (report.encryptionKeyUrl) {
            getKey(report);
          }
        });
    }

    function openCancelReportModal(id) {
      var template = require('./ediscovery-cancel-report-modal.html');

      $modal.open({
        type: 'dialog',
        template: template,
      }).result.then(function () {
        cancelReport(id);
      });
    }

    function cancelReport(id) {
      if ($scope.reportsBeingCancelled[id]) {
        return;
      }
      $scope.reportsBeingCancelled[id] = true;
      EdiscoveryService.patchReport(id, {
        state: ReportStates.ABORTED,
      }).then(function () {
        if (!EdiscoveryNotificationService.notificationsEnabled()) {
          Notification.success('ediscovery.searchResults.reportCancelled');
        }
        pollAvalonReport();
      }, function (err) {
        if (err.status !== 410) {
          Notification.error('ediscovery.searchResults.reportCancelFailed');
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
      enableSorting: false,
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
                  if (r.state === ReportStates.RUNNING) {
                    EdiscoveryService.getReport(r.id).then(function (updatedReport) {
                      r = updatedReport;
                      vm.reports[index] = updatedReport;
                      gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);
                    });
                  } else {
                    ReportUtilService.tweakReport(r);
                  }
                });
              }, 3000);
            }
          }
        });
      },
      columnDefs: [{
        field: 'displayName',
        displayName: $translate.instant('ediscovery.reportsList.name'),
        sortable: true,
        cellTemplate: require('modules/ediscovery/cell-template-name.html'),
        width: '*',
      }, {
        field: 'createdTime',
        displayName: $translate.instant('ediscovery.reportsList.dateGenerated'),
        sortable: false,
        cellTemplate: require('modules/ediscovery/cell-template-createdTime.html'),
        width: '*',
      }, {
        field: 'size',
        displayName: $translate.instant('ediscovery.reportsList.size'),
        sortable: false,
        cellTemplate: require('modules/ediscovery/cell-template-size.html'),
        width: '110',
      }, {
        field: 'state',
        displayName: $translate.instant('ediscovery.reportsList.status'),
        sortable: false,
        cellTemplate: require('modules/ediscovery/cell-template-state.html'),
        width: '*',
      }, {
        field: 'actions',
        displayName: $translate.instant('ediscovery.reportsList.actions'),
        sortable: false,
        cellTemplate: require('modules/ediscovery/cell-template-action.html'),
        width: '160',
      }],
    };

    function pollAvalonReport() {
      EdiscoveryService.getReports($scope.offset, $scope.limit).then(function (res) {
        var reports = res.reports;
        var paging = res.paging;
        vm.isReportGenerating = _.get(reports, '[0].state') !== (ReportStates.COMPLETED || ReportStates.FAILED);
        vm.moreReports = !!_.get(paging, 'next');
        if (vm.concat) {
          vm.reports = vm.reports.concat(reports);
        } else {
          vm.reports = reports;
        }
        if (vm.gridApi) {
          vm.gridApi.infiniteScroll.dataLoaded(false, true);
        }
      }).finally(function () {
        vm.readingReports = false;
      });
    }

    function rerunReport(report) {
      $state.go('ediscovery.search', {
        report: report,
        reRun: true,
      });
    }

    function viewReport(report) {
      Analytics.trackEdiscoverySteps(Analytics.sections.EDISCOVERY.eventNames.SEARCH_SECTION);
      $state.go('ediscovery.search', {
        report: report,
      });
    }

    //agendel 6/29/17: currently backend only displays the reports where this condition is true.
    // leaving this code in since requrements are not certain
    function isUserReportCreator(report) {
      return Authinfo.getUserId() === report.createdByUserId;
    }

    //agendel 6/29/17: see note above. Given current backend the tooltip will never show
    function getKeyTooltip(report) {
      if (isUserReportCreator(report)) {
        return '';
      } else {
        return report.createdByUserId;
      }
    }

    function getKey(report) {
      if (isUserReportCreator(report)) {
        EdiscoveryService.getReportKey(report.encryptionKeyUrl, spark)
          .then(function (key) {
            $scope.reportName = report.displayName;
            $scope.reportKey = key;
            EdiscoveryService.openReportModal($scope);
          })
          .catch(function () {
            Notification.error('ediscovery.encryption.unableGetPassword');
          });
      }
    }
  }
}());
