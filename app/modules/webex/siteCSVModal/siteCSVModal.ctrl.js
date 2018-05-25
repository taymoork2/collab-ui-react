(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVModalCtrl', SiteCSVModalCtrl);

  /*@ngInject*/
  function SiteCSVModalCtrl(
    $scope,
    $stateParams,
    $log,
    Notification,
    WebExApiGatewayService,
    SiteListService,
    Authinfo
  ) {
    var vm = this;

    vm.onFileTypeError = onFileTypeError;
    vm.resetFile = resetFile;
    vm.startExport = startExport;
    vm.startImport = startImport;

    vm.modal = {
      file: null,
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
    }

    function resetFile() {
      vm.modal.file = null;
    }

    function startExport() {
      var siteRow = vm.siteRow;
      var siteUrl = siteRow.license.siteUrl;

      vm.requestingExport = true;

      WebExApiGatewayService.csvExport(
        siteUrl,
        siteRow.csvMock.mockExport
      ).then(

        function success() {
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
          var funcName = 'SiteListCtrl.csvExport().catchError()';
          var logMsg = '';

          logMsg = funcName + '\n' +
            'response=' + JSON.stringify(response);
          $log.log(logMsg);

          displayResult(
            false,
            false,
            'siteList.exportRejectedToast',
            response.errId
          );
        }
      );
    }

    function startImport() {
      vm.requestingImport = true;

      if (
        (null == vm.modal.file) ||
        (0 == vm.modal.file.length)
      ) {
        displayResult(
          false,
          false,
          'siteList.importInvalidFileToast',
          0
        );
      } else {
        //TBD: Don't use then(successfn,errorfn), its deprecated in some libraries. Instead use promise.catch(errorfn).then(successfn)
        WebExApiGatewayService.csvImport(vm).then(
          function success() {
            displayResult(
              true,
              true,
              'siteList.importStartedToast',
              0
            );
          },

          function error(response) {
            // TBD: Actual error result handling
            displayResult(
              false,
              true,
              'siteList.csvRejectedToast-' + response.errorCode,
              response.errorCode
            );
          }
        ).catch(
          function catchError(response) {
            displayResult(
              false,
              false,
              'siteList.importRejectedToast',
              response.errorCode
            );
          }
        );
      }
    }

    function displayResult(
      isSuccess,
      closeModal,
      resultMsg,
      errId
    ) {
      SiteListService.updateCSVStatusInRow(vm.siteUrl);

      if (isSuccess) {
        Notification.success(resultMsg);
      } else {
        //If this is a read only admin and WebEx returns "Access denied, additional privileges are required"
        if (errId == '000001' && _.isFunction(Authinfo.isReadOnlyAdmin) && Authinfo.isReadOnlyAdmin()) {
          Notification.notifyReadOnly(errId);
        } else {
          Notification.error(resultMsg);
        }
      }

      if (
        (closeModal) &&
        (_.isFunction($scope.$close))
      ) {
        $scope.$close();
      } else {
        vm.requestingImport = false;
        vm.requestingImExport = false;
      }
    }
  }
})();
