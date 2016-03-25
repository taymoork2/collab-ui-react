(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVResultsCtrl', SiteCSVResultsCtrl);

  /*@ngInject*/
  function SiteCSVResultsCtrl(
    $scope,
    $state,
    $stateParams,
    $translate,
    $log,
    WebExApiGatewayService
  ) {
    var funcName = "SiteCSVResultsCtrl()";
    var logMsg = '';

    $scope.viewReady = false;

    var _this = this;

    logMsg = funcName + "\n" +
      "$stateParams=" + JSON.stringify($stateParams);
    $log.log(logMsg);

    $scope.csvStatusObj = $stateParams.csvStatusObj;

    $scope.gridRows = [];

    if (
      ("exportCompletedNoErr" === $scope.csvStatusObj.status) ||
      ("exportCompletedWithErr" === $scope.csvStatusObj.status)
    ) {

      $scope.modalTitle = "Export Results";

      $scope.gridRows.push({
        id: 'import-request',
        title: 'Request:',
        value: 'Export User WebEx Attributes',
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'export-started-time',
        title: 'Export started:',
        value: '',
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'export-finished-time',
        title: 'Export finished:',
        value: '',
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'export-records-total',
        title: 'Total records available:',
        value: 5,
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'export-records-successful',
        title: 'Records successfully exported:',
        value: 4,
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'export-records-failed',
        title: 'Records failed:',
        value: 1,
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'export-download-file',
        title: 'Download:',
        value: 'Exported CSV file',
        fileDownloadUrl: 'https://google.com'
      });

    } else if (
      ("importCompletedNoErr" === $scope.csvStatusObj.status) ||
      ("importCompletedWithErr" === $scope.csvStatusObj.status)
    ) {

      $scope.modalTitle = "Import Results";

      if ("exportCompletedWithErr" === $scope.csvStatusObj.status) {
        $scope.importErrorFile = "fakeImportErrorFile.csv";
      }

      $scope.gridRows.push({
        id: 'export-request',
        title: 'Request:',
        value: 'Import completed',
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'import-file-name',
        title: 'File name:',
        value: '',
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'import-started-time',
        title: 'Import started:',
        value: '',
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'import-finished-time',
        title: 'Import finished:',
        value: '',
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'import-records-total',
        title: 'Total records requested:',
        value: 5,
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'import-records-updated',
        title: 'Records successfully updated:',
        value: 3,
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'import-records-failed',
        title: 'Records failed:',
        value: 2,
        fileDownloadUrl: null
      });

      $scope.gridRows.push({
        id: 'import-download-file',
        title: 'Download:',
        value: 'Import error log',
        fileDownloadUrl: 'https://yahoo.com'
      });
    }

    logMsg = funcName + "\n" +
      "$scope.gridRows=" + JSON.stringify($scope.gridRows);
    $log.log(logMsg);

    /*
    $scope.gridOptions = {
      data: 'gridRows',
      multiSelect: false,
      enableRowSelection: false,
      enableColumnMenus: false,
      rowHeight: 44,
      columnDefs: [],
    };

    $scope.gridOptions.columnDefs.push({
      field: 'title',
      displayName: '',
      sortable: false
    });

    $scope.gridOptions.columnDefs.push({
      field: 'value',
      displayName: '',
      sortable: false
    });
    */

    $scope.viewReady = true;
  } // SiteCSVResultsCtrl()
})(); // top level function
