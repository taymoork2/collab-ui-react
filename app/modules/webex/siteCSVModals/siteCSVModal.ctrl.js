(function () {
  'use strict';

  angular.module('WebExApp').controller('SiteCSVModalCtrl', SiteCSVModalCtrl);

  /*@ngInject*/
  function SiteCSVModalCtrl(
    $scope,
    $state,
    $stateParams,
    $translate,
    $log,
    Notification,
    WebExApiGatewayService,
    SiteListService
  ) {
    var funcName = "SiteCSVModalCtrl()";
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
      var funcName = "SiteCSVModalCtrl.startImport()";

      logMsg = funcName + "\n" +
        "vm.siteUrl=" + JSON.stringify(vm.siteUrl) +
        "vm.csvImportObj=" + JSON.stringify(vm.csvImportObj) +
        "vm.modal.file=" + vm.modal.file;
      //$log.log(logMsg);

      if (
        (null == vm.modal.file) ||
        (0 == vm.modal.file.length)
      ) {

        // TBD: use correct error string
        Notification.error('siteList.importInvalidFileToast');

      } else {

        //TBD: Don't use then(successfn,errorfn), its deprecated in some libraries. Instead use promise.catch(errorfn).then(successfn)
        WebExApiGatewayService.csvImport(vm).then(
          function success(response) {
            Notification.success($translate.instant('siteList.importStartedToast'));

            if (_.isFunction($scope.$close)) {
              $scope.$close();
            }
          },

          function error(response) {
            // TBD: Actual error result handling
            Notification.error($translate.instant('siteList.importRejectedToast'));
          }
        ).catch(
          function catchError(response) {
            Notification.error($translate.instant('siteList.importRejectedToast'));
          }
        ); // WebExApiGatewayService.csvImport()
      }
    };
  } // SiteCSVModalCtrl()
})(); // top level function
