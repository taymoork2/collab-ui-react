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
    $log.log(logMsg);

    vm.viewReady = false;
    vm.csvStatusObj = $stateParams.csvStatusObj;
    vm.gridRows = [];

    if (
      ("exportCompletedNoErr" === vm.csvStatusObj.status) ||
      ("exportCompletedWithErr" === vm.csvStatusObj.status)
    ) {

      vm.modalTitle = "Export Results";

      /*
      vm.gridRows.push({
        id: 'import-request',
        title: 'Request:',
        value: 'Export finished',
        fileDownloadUrl: null
      });
      */

      vm.gridRows.push({
        id: 'export-started-time',
        title: 'Export started:',
        value: vm.csvStatusObj.details.created,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-finished-time',
        title: 'Export finished:',
        value: vm.csvStatusObj.details.finished,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-records-total',
        title: 'Total records available:',
        value: vm.csvStatusObj.details.totalRecords,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-records-successful',
        title: 'Records successfully exported:',
        value: vm.csvStatusObj.details.successRecords,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-records-failed',
        title: 'Records failed:',
        value: vm.csvStatusObj.details.failedRecords,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-download-csv-file',
        title: 'Download:',
        value: 'Exported CSV file',
        fileDownloadUrl: vm.csvStatusObj.details.exportFileLink
      });

    } else if (
      ("importCompletedNoErr" === vm.csvStatusObj.status) ||
      ("importCompletedWithErr" === vm.csvStatusObj.status)
    ) {

      vm.modalTitle = "Import Results";

      /*
      vm.gridRows.push({
        id: 'export-request',
        title: 'Request:',
        value: 'Import finished',
        fileDownloadUrl: null
      });
      */

      vm.gridRows.push({
        id: 'import-file-name',
        title: 'File name:',
        value: vm.csvStatusObj.details.importFileName,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-started-time',
        title: 'Import started:',
        value: vm.csvStatusObj.details.created,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-finished-time',
        title: 'Import finished:',
        value: vm.csvStatusObj.details.finished,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-records-total',
        title: 'Total records requested:',
        value: vm.csvStatusObj.details.totalRecords,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-records-updated',
        title: 'Records successfully updated:',
        value: vm.csvStatusObj.details.successRecords,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-records-failed',
        title: 'Records failed:',
        value: vm.csvStatusObj.details.failedRecords,
        fileDownloadUrl: null
      });

      if (0 < vm.csvStatusObj.details.failedRecords) {
        vm.gridRows.push({
          id: 'import-download-err-file',
          title: 'Download:',
          value: 'Error log',
          fileDownloadUrl: vm.csvStatusObj.details.errorLogLink
        });
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
  } // SiteCSVResultsCtrl()
})(); // top level function
