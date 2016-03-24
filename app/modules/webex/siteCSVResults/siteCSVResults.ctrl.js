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

      vm.gridRows.push({
        id: 'import-request',
        title: 'Request:',
        value: 'Export User WebEx Attributes',
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-started-time',
        title: 'Export started:',
        value: '',
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-finished-time',
        title: 'Export finished:',
        value: '',
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-records-total',
        title: 'Total records available:',
        value: 5,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-records-successful',
        title: 'Records successfully exported:',
        value: 4,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-records-failed',
        title: 'Records failed:',
        value: 1,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'export-download-file',
        title: 'Download:',
        value: 'Exported CSV file',
        fileDownloadUrl: 'https://google.com'
      });
      vm.gridRows.push({
        id: 'export-request',
        title: 'Request:',
        value: 'Import completed',
        fileDownloadUrl: null
      });

    } else if (
      ("importCompletedNoErr" === vm.csvStatusObj.status) ||
      ("importCompletedWithErr" === vm.csvStatusObj.status)
    ) {

      vm.modalTitle = "Import Results";

      vm.gridRows.push({
        id: 'import-file-name',
        title: 'File name:',
        value: '',
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-started-time',
        title: 'Import started:',
        value: '',
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-finished-time',
        title: 'Import finished:',
        value: '',
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-records-total',
        title: 'Total records requested:',
        value: 5,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-records-updated',
        title: 'Records successfully updated:',
        value: 3,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-records-failed',
        title: 'Records failed:',
        value: 2,
        fileDownloadUrl: null
      });

      vm.gridRows.push({
        id: 'import-download-file',
        title: 'Download:',
        value: 'Import error log',
        fileDownloadUrl: 'https://yahoo.com'
      });
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
