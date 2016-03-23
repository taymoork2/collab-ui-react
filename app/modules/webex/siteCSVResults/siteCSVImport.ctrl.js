(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVImportCtrl', SiteCSVImportCtrl);

  /*@ngInject*/
  function SiteCSVImportCtrl(
    $scope,
    $state,
    $stateParams,
    $translate,
    $log,
    Notification,
    WebExApiGatewayService,
    SiteListService
  ) {
    var funcName = "SiteCSVImportCtrl()";
    var logMsg = '';
    var _this = this;

    logMsg = funcName + "\n" +
      "$stateParams=" + JSON.stringify($stateParams);
    $log.log(logMsg);

    $scope.modal = {};

    $scope.csvImportObj = $stateParams.csvImportObj;
    $scope.siteUrl = $scope.csvImportObj.license.siteUrl;
    $scope.viewReady = true;
    $scope.resetFile = resetFile;

    $scope.onFileSizeError = function () {
      Notification.notify([$translate.instant('firstTimeWizard.csvMaxSizeError')], 'error');
    };

    $scope.onFileTypeError = function () {
      Notification.notify([$translate.instant('firstTimeWizard.csvFileTypeError')], 'error');
    };

    function resetFile() {
      $scope.modal.file = null;
    }

    $scope.startImport = function () {
      var funcName = "SiteCSVImportCtrl.startImport()";

      logMsg = funcName + "\n" +
        "$scope.siteUrl=" + JSON.stringify($scope.siteUrl) +
        "$scope.csvImportObj=" + JSON.stringify($scope.csvImportObj) +
        "$scope.modal.file=" + JSON.stringify($scope.modal.file);
      //$log.log(logMsg);

      WebExApiGatewayService.csvImport($scope.siteUrl, $scope.modal.file).then(
        function success(response) {
          //TBD Close the modal before showing the green toast
          Notification.success($translate.instant('siteList.importStartedToast'));
          SiteListService.updateCSVColumnInRow($scope.csvImportObj);
        },

        function error(response) {
          // TBD: Actual error result handling
          Notification.error($translate.instant('siteList.importRejectedToast'));
        }
      ).catch(
        function catchError(response) {
          Notification.error($translate.instant('siteList.importRejectedToast'));
          SiteListService.updateCSVColumnInRow($scope.csvImportObj);
        }
      ); // WebExApiGatewayService.csvImport()
    };

  } // SiteCSVImportCtrl()
})(); // top level function
