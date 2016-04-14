(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVResultsCtrl', SiteCSVResultsCtrl);

  /*@ngInject*/
  function SiteCSVResultsCtrl(
    $state,
    $stateParams,
    $translate,
    $log,
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
        id: 'export-started-time',
        title: $translate.instant("webexCSVResultsModal.csvStarted"),
        value: vm.csvStatusObj.details.created,
      });

      vm.gridRows.push({
        id: 'export-finished-time',
        title: $translate.instant("webexCSVResultsModal.csvFinished"),
        value: vm.csvStatusObj.details.finished,
      });

      vm.gridRows.push({
        id: 'export-records-total',
        title: $translate.instant("webexCSVResultsModal.csvExportRecordsAvailable"),
        value: vm.csvStatusObj.details.totalRecords,
      });

      vm.gridRows.push({
        id: 'export-records-successful',
        title: $translate.instant("webexCSVResultsModal.csvExportRecordsSuccessful"),
        value: vm.csvStatusObj.details.successRecords,
      });

      vm.gridRows.push({
        id: 'export-records-failed',
        title: $translate.instant("webexCSVResultsModal.csvRecordsFailed"),
        value: vm.csvStatusObj.details.failedRecords,
      });

      vm.gridRows.push({
        id: 'export-download-csv-file',
        title: $translate.instant("webexCSVResultsModal.csvExportDownloadFile"),
        value: null,
      });

      vm.downloadFileUrl = vm.csvStatusObj.details.exportFileLink;
      vm.downloadFileName = $translate.instant("webexCSVResultsModal.csvExportResultsFilename");

    } else if (
      ("importCompletedNoErr" === vm.csvStatusObj.status) ||
      ("importCompletedWithErr" === vm.csvStatusObj.status)
    ) {

      vm.modalId = "csvImport";
      vm.modalTitle = $translate.instant("webexCSVResultsModal.csvImportTitle");

      vm.gridRows.push({
        id: 'import-file-name',
        title: $translate.instant("webexCSVResultsModal.csvImportFileName"),
        value: vm.csvStatusObj.details.importFileName,
      });

      vm.gridRows.push({
        id: 'import-started-time',
        title: $translate.instant("webexCSVResultsModal.csvImportFileName"),
        value: vm.csvStatusObj.details.created,
      });

      vm.gridRows.push({
        id: 'import-finished-time',
        title: $translate.instant("webexCSVResultsModal.csvFinished"),
        value: vm.csvStatusObj.details.finished,
      });

      vm.gridRows.push({
        id: 'import-records-total',
        title: $translate.instant("webexCSVResultsModal.csvImportRecordsRequested"),
        value: vm.csvStatusObj.details.totalRecords,
      });

      vm.gridRows.push({
        id: 'import-records-updated',
        title: $translate.instant("webexCSVResultsModal.csvImportRecordsUpdated"),
        value: vm.csvStatusObj.details.successRecords,
      });

      vm.gridRows.push({
        id: 'import-records-failed',
        title: $translate.instant("webexCSVResultsModal.csvRecordsFailed"),
        value: vm.csvStatusObj.details.failedRecords,
      });

      if (0 < vm.csvStatusObj.details.failedRecords) {
        vm.gridRows.push({
          id: 'import-download-err-file',
          title: $translate.instant("webexCSVResultsModal.csvImportDownloadErr"),
          value: null,
        });

        vm.downloadFileUrl = vm.csvStatusObj.details.errorLogLink;
        vm.downloadFileName = $translate.instant("webexCSVResultsModal.csvImportErrFilename");
      }
    }

    logMsg = funcName + "\n" +
      "vm.gridRows=" + JSON.stringify(vm.gridRows);
    $log.log(logMsg);

    /*
    vm.gridOptions = {
      data: 'gridRows',
      multiSelect: false,
      enableRowSelection: false,
      enableColumnMenus: false,
      rowHeight: 44,
      columnDefs: [],
    };

    vm.gridOptions.columnDefs.push({
      field: 'title',
      displayName: '',
      sortable: false
    });

    vm.gridOptions.columnDefs.push({
      field: 'value',
      displayName: '',
      sortable: false
    });
    */

    vm.viewReady = true;

    vm.csvFileDownload = function (downloadUrl) {
      var funcName = "csvFileDownload()";
      var logMsg = "";

      downloadUrl = downloadUrl.replace("http:", "https:");

      logMsg = funcName + "\n" +
        "downloadUrl=" + downloadUrl;
      $log.log(logMsg);

      WebExApiGatewayService.csvFileDownload(
        vm.siteRow.license.siteUrl,
        downloadUrl,
        vm.siteRow.csvMock.mockFileDownload
      ).then(

        function success(response) {
          var funcName = "WebExApiGatewayService.csvFileDownload.success()";
          var logMsg = "";

          $log.log(funcName);
        },

        function error(response) {
          var funcName = "WebExApiGatewayService.csvFileDownload.error()";
          var logMsg = "";

          $log.log(funcName);
        }
      ); // WebExApiGatewayService.csvFileDownload().then()
    }; // csvFileDownload()
  } // SiteCSVResultsCtrl()
})(); // top level function
