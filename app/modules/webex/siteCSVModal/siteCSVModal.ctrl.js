(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVModalCtrl', SiteCSVModalCtrl);

  /*@ngInject*/
  function SiteCSVModalCtrl(
    $scope,
    $stateParams,
    $translate,
    $log,
    Notification,
    WebExApiGatewayService,
    WebExSiteRowService
  ) {

    var funcName = "SiteCSVModalCtrl()";
    var logMsg = '';
    var vm = this;

    logMsg = funcName + "\n" +
      "$stateParams=" + JSON.stringify($stateParams);
    // $log.log(logMsg);

    vm.onFileTypeError = onFileTypeError;
    vm.resetFile = resetFile;
    vm.startExport = startExport;
    vm.startImport = startImport;

    vm.modal = {
      file: null
    };

    vm.siteRow = $stateParams.siteRow;
    vm.siteUrl = $stateParams.siteRow.license.siteUrl;
    vm.requestingImport = false;
    vm.requestingExport = false;
    vm.viewReady = true;

    function onFileTypeError() {
      displayResult(
        false,
        false,
        'firstTimeWizard.csvFileTypeError'
      );
    } // onFileTypeError()

    function resetFile() {
      vm.modal.file = null;
    } // resetFile()

    function startExport() {
      var funcName = "SiteCSVModalCtrl.startExport()";

      var siteRow = vm.siteRow;
      var siteUrl = siteRow.license.siteUrl;

      logMsg = funcName + "\n" +
        "siteRow=" + JSON.stringify(siteRow);
      // $log.log(logMsg);

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl;
      // $log.log(logMsg);

      vm.requestingExport = true;

      WebExApiGatewayService.csvExport(
        siteUrl,
        siteRow.csvMock.mockExport
      ).then(

        function success(response) {
          displayResult(
            true,
            true,
            'siteList.exportStartedToast'
          );
        },

        function error(response) {
          displayResult(
            false,
            true,
            'siteList.csvRejectedToast-' + response.errorCode
          );
        }
      ).catch(
        function catchError(response) {
          var funcName = "SiteListCtrl.csvExport().catchError()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          displayResult(
            false,
            false,
            'siteList.exportRejectedToast'
          );
        } // catchError()
      ); // WebExApiGatewayService.csvExport()
    } // startExport()

    function startImport() {
      var funcName = "SiteCSVModalCtrl.startImport()";

      logMsg = funcName + "\n" +
        "vm.siteUrl=" + JSON.stringify(vm.siteUrl) +
        "vm.siteRow=" + JSON.stringify(vm.siteRow) +
        "vm.modal.file=" + vm.modal.file;
      //$log.log(logMsg);

      vm.requestingImport = true;

      if (
        (null == vm.modal.file) ||
        (0 == vm.modal.file.length)
      ) {

        displayResult(
          false,
          false,
          'siteList.importInvalidFileToast'
        );
      } else {
        //TBD: Don't use then(successfn,errorfn), its deprecated in some libraries. Instead use promise.catch(errorfn).then(successfn)
        WebExApiGatewayService.csvImport(vm).then(
          function success(response) {
            displayResult(
              true,
              true,
              'siteList.importStartedToast'
            );
          },

          function error(response) {
            // TBD: Actual error result handling
            displayResult(
              false,
              true,
              'siteList.csvRejectedToast-' + response.errorCode
            );
          }
        ).catch(
          function catchError(response) {
            displayResult(
              false,
              false,
              'siteList.importRejectedToast'
            );
          }
        ); // WebExApiGatewayService.csvImport()
      }
    } // startImport()

    function displayResult(
      isSuccess,
      closeModal,
      resultMsg
    ) {

      var funcName = "displayResult()";
      var logMsg = "";

      WebExSiteRowService.updateCSVStatusInRow(vm.siteUrl);
      //SiteListService.updateCSVStatusInRow(vm.siteRow);

      if (isSuccess) {
        Notification.success($translate.instant(resultMsg));
      } else {
        Notification.error($translate.instant(resultMsg));
      }

      if (
        (closeModal) &&
        (_.isFunction($scope.$close))
      ) {

        //SiteListService.updateCSVStatusInRow(vm.siteRow);
        $scope.$close();
      } else {
        vm.requestingImport = false;
        vm.requestingImExport = false;
      }
    } // displayResult()
  } // SiteCSVModalCtrl()
})(); // top level function
