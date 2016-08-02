(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVResultsCtrl', SiteCSVResultsCtrl);

  /*@ngInject*/
  function SiteCSVResultsCtrl(
    $log,
    $stateParams,
    $translate,
    WebExUtilsFact
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

    var createdTime = new Date(vm.csvStatusObj.details.created);
    var startedTime = new Date(vm.csvStatusObj.details.started);
    var finishedTime = new Date(vm.csvStatusObj.details.finished);

    var formattedCreatedTime = createdTime.toUTCString();
    var formattedStartedTime = startedTime.toUTCString();
    var formattedFinishedTime = finishedTime.toUTCString();

    //Insert "at" between date and time
    var currentYear = finishedTime.getUTCFullYear();
    var splitResult = formattedFinishedTime.split(currentYear); //Results in an array of length 2
    var displayFinishedTime = splitResult[0] + currentYear + " at" + splitResult[1];

    var logMsg = funcName + "\n" +
      "formattedCreatedTime=" + formattedCreatedTime + "\n" +
      "formattedStartedTime=" + formattedStartedTime + "\n" +
      "formattedFinishedTime=" + formattedFinishedTime + "\n" +
      "displayFinishedTime=" + displayFinishedTime;
    $log.log(logMsg);

    if (2 === vm.csvStatusObj.details.jobType) { // export results
      vm.modalId = "csvExport";
      vm.modalTitle = $translate.instant("webexCSVResultsModal.csvExportTitle");

      vm.gridRows.push({
        id: 'export-finished-time',
        title: $translate.instant("webexCSVResultsModal.csvFinished"),
        value: displayFinishedTime
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

    } else if (1 === vm.csvStatusObj.details.jobType) { // import results

      vm.modalId = "csvImport";
      vm.modalTitle = $translate.instant("webexCSVResultsModal.csvImportTitle");

      vm.gridRows.push({
        id: 'import-finished-time',
        title: $translate.instant("webexCSVResultsModal.csvFinished"),
        value: displayFinishedTime
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
