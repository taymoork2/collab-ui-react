(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVImportModalCtrl', SiteCSVImportModalCtrl);

  /*@ngInject*/
  function SiteCSVImportModalCtrl(
    $scope,
    $state,
    $stateParams,
    $translate,
    $log,
    Notification,
    WebExApiGatewayService,
    SiteListService
  ) {
    var funcName = "SiteCSVImportModalCtrl()";
    var logMsg = '';
    var vm = this;

    logMsg = funcName + "\n" +
      "$stateParams=" + JSON.stringify($stateParams);
    // $log.log(logMsg);

    vm.modal = {};

    vm.csvImportObj = $stateParams.csvImportObj;
    vm.siteUrl = vm.csvImportObj.license.siteUrl;
    vm.viewReady = true;
    vm.resetFile = resetFile;

    /**vm.onFileSizeError = function () {
      Notification.error($translate.instant('firstTimeWizard.csvMaxSizeError'));
    };**/

    vm.onFileTypeError = function () {
      Notification.error($translate.instant('firstTimeWizard.csvFileTypeError'));

    };

    function resetFile() {
      vm.modal.file = null;
    }

    vm.startImport = function () {
      var funcName = "SiteCSVImportModalCtrl.startImport()";

      logMsg = funcName + "\n" +
        "vm.siteUrl=" + JSON.stringify(vm.siteUrl);
      // $log.log(logMsg);

      if (
        (null == vm.modal.file) ||
        (0 == vm.modal.file.length)
      ) {

        Notification.error('siteList.importInvalidFileToast');

      } else {

        //TBD: Don't use then(successfn,errorfn), its deprecated in some libraries. Instead use promise.catch(errorfn).then(successfn)
        WebExApiGatewayService.csvImportOld(vm).then(
          function success(response) {
            displayResultAndCloseModal(
              true,
              'siteList.importStartedToast'
            );
          },

          function error(response) {
            displayResultAndCloseModal(
              false,
              'siteList.csvRejectedToast-' + response.errorCode
            );
          }
        ).catch(
          function catchError(response) {
            displayResultAndCloseModal(
              false,
              'siteList.importRejectedToast'
            );
          }
        ); // WebExApiGatewayService.csvImportOld()
      }

      function displayResultAndCloseModal(
        isSuccess,
        resultMsg
      ) {

        var funcName = "displayResultAndCloseModal()";
        var logMsg = "";

        SiteListService.updateCSVStatusInRow(vm.csvImportObj);

        if (isSuccess) {
          Notification.success($translate.instant(resultMsg));
        } else {
          Notification.error($translate.instant(resultMsg));
        }

        if (_.isFunction($scope.$close)) {
          $scope.$close();
        }
      } // displayResultAndCloseModal()
    }; // startImport()
  } // SiteCSVImportModalCtrl()
})(); // top level function
