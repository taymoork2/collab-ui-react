(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVResultsCtrl', SiteCSVResultsCtrl);

  /*@ngInject*/
  function SiteCSVResultsCtrl(
    $state,
    $stateParams,
    $translate,
    $log,
    WebExUtilsFact,
    WebExApiGatewayService
  ) {
    var funcName = "SiteCSVResultsCtrl()";
    var logMsg = '';

    var vm = this;

    logMsg = funcName + "\n" +
      "$stateParams=" + JSON.stringify($stateParams);
    // $log.log(logMsg);

    vm.viewReady = false;
    vm.siteRow = $stateParams.siteRow;
    vm.csvStatusObj = $stateParams.siteRow.csvStatusObj;
    vm.siteUrl = $stateParams.siteRow.license.siteUrl;
    vm.siteName = WebExUtilsFact.getSiteName(vm.siteUrl);
    vm.gridRows = [];

    vm.downloadFileUrl = null;
    vm.downloadFileName = null;

    if (
      ("exportCompletedNoErr" === vm.csvStatusObj.status) ||
      ("exportCompletedWithErr" === vm.csvStatusObj.status)
    ) {

      vm.modalId = "csvExport";
      vm.modalTitle = $translate.instant("webexCSVResultsModal.csvExportTitle");

      vm.gridRows.push({
        id: 'export-finished-time',
        title: $translate.instant("webexCSVResultsModal.csvFinished"),
        value: vm.csvStatusObj.details.finished,
      });

      vm.gridRows.push({
        id: 'export-records-total',
        title: $translate.instant("webexCSVResultsModal.csvRecordsRequested"),
        value: vm.csvStatusObj.details.totalRecords,
      });

      vm.gridRows.push({
        id: 'export-records-successful',
        title: $translate.instant("webexCSVResultsModal.csvRecordsReturned"),
        value: vm.csvStatusObj.details.successRecords,
      });

      vm.gridRows.push({
        id: 'export-records-failed',
        title: $translate.instant("webexCSVResultsModal.csvRecordsFailed"),
        value: vm.csvStatusObj.details.failedRecords,
      });

      vm.downloadFileUrl = "https://" + vm.siteUrl + "/meetingsapi/v1/files/" + vm.csvStatusObj.details.exportFileLink;
      vm.downloadFileName = "WebEx-" + vm.siteName + "-SiteUsers.csv";

      logMsg = funcName + "\n" +
        "vm.downloadFileUrl=" + vm.downloadFileUrl + "\n" +
        "vm.downloadFileName=" + vm.downloadFileName;
      // $log.log(logMsg);

    } else if (
      ("importCompletedNoErr" === vm.csvStatusObj.status) ||
      ("importCompletedWithErr" === vm.csvStatusObj.status)
    ) {

      vm.modalId = "csvImport";
      vm.modalTitle = $translate.instant("webexCSVResultsModal.csvImportTitle");

      vm.gridRows.push({
        id: 'import-finished-time',
        title: $translate.instant("webexCSVResultsModal.csvFinished"),
        value: vm.csvStatusObj.details.finished,
      });

      vm.gridRows.push({
        id: 'import-records-total',
        title: $translate.instant("webexCSVResultsModal.csvRecordsRequested"),
        value: vm.csvStatusObj.details.totalRecords,
      });

      vm.gridRows.push({
        id: 'import-records-updated',
        title: $translate.instant("webexCSVResultsModal.csvRecordsUpdated"),
        value: vm.csvStatusObj.details.successRecords,
      });

      vm.gridRows.push({
        id: 'import-records-failed',
        title: $translate.instant("webexCSVResultsModal.csvRecordsFailed"),
        value: vm.csvStatusObj.details.failedRecords,
      });

      if (0 < vm.csvStatusObj.details.failedRecords) {
        vm.downloadFileUrl = "https://" + vm.siteUrl + "/meetingsapi/v1/files/" + vm.csvStatusObj.details.errorLogLink;
        vm.downloadFileName = "WebEx-" + vm.siteName + "-ImportErr.csv";

        logMsg = funcName + "\n" +
          "vm.downloadFileUrl=" + vm.downloadFileUrl + "\n" +
          "vm.downloadFileName=" + vm.downloadFileName;
        // $log.log(logMsg);
      }
    } // export/import results

    logMsg = funcName + "\n" +
      "vm.gridRows=" + JSON.stringify(vm.gridRows);
    // $log.log(logMsg);

    vm.viewReady = true;
  } // SiteCSVResultsCtrl()
})(); // top level function
