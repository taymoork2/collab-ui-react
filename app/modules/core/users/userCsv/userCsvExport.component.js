(function () {
  'use strict';

  angular.module('Core')
    .component('crUserCsvExport', {
      controller: UserCsvExportController,
      templateUrl: 'modules/core/users/userCsv/userCsvExport.tpl.html',
      bindings: {
        onStatusChange: '&',
        isOverExportThreshold: '<',
        useCsvDownloadDirective: '<'
      }
    });

  /////////////////
  /* @ngInject */
  function UserCsvExportController($scope, $rootScope, $modal, $translate, $timeout, $window, $element, CsvDownloadService, Notification) {
    var vm = this;

    vm.$onInit = onInit;
    vm.$postLink = postLink;
    vm.exportCsv = exportCsv;
    vm.downloadTemplate = downloadTemplate;
    vm.cancelDownload = cancelDownload;
    vm.isDownloading = false;

    ////////////////
    var exportFilename;
    var blobAnchor;
    var wasCanceled;
    var useIEBlobSave;

    function onInit() {
      vm.isDownloading = false;
      vm.isOverExportThreshold = !!(vm.isOverExportThreshold);
      vm.useCsvDownloadDirective = !!(vm.useCsvDownloadDirective);

      exportFilename = $translate.instant('usersPage.csvFilename');
      wasCanceled = false;
      useIEBlobSave = !_.isUndefined($window.navigator.msSaveOrOpenBlob);

    }

    function postLink() {
      blobAnchor = $element.find('.download-anchor');
    }

    function beginUserCsvDownload() {
      // start the export
      if (vm.useCsvDownloadDirective) {
        $rootScope.$emit('csv-download-request', {
          csvType: CsvDownloadService.typeUser,
          tooManyUsers: vm.isOverExportThreshold,
          suppressWarning: true,
          filename: exportFilename
        });
      } else {
        startDownload(CsvDownloadService.typeUser, exportFilename);
      }
    }

    function exportCsv() {
      $modal.open({
        type: 'dialog',
        templateUrl: 'modules/core/users/userCsv/userCsvExportConfirm.tpl.html'
      }).result.then(function () {
        if (vm.isOverExportThreshold) {
          // warn that entitlements won't be exported since there are too many users
          $modal.open({
            type: 'dialog',
            templateUrl: 'modules/core/users/userCsv/userCsvExportConfirm10K.tpl.html',
            controller: function () {
              var ctrl = this;
              ctrl.maxUsers = CsvDownloadService.userExportThreshold;
            },
            controllerAs: 'ctrl'
          }).result.then(function () {
            beginUserCsvDownload();
          });
        } else {
          beginUserCsvDownload();
        }
      });
    }

    function downloadTemplate() {
      // start the download
      if (vm.useCsvDownloadDirective) {
        $rootScope.$emit('csv-download-request', {
          csvType: CsvDownloadService.typeTemplate,
          tooManyUsers: vm.isOverExportThreshold,
          suppressWarning: true,
          filename: 'template.csv'
        });
      } else {
        startDownload(CsvDownloadService.typeTemplate, 'template.csv');
      }
    }

    $rootScope.$on('csv-download-request-started', function () {
      vm.isDownloading = true;
      vm.onStatusChange({
        isExporting: true
      });
    });

    $rootScope.$on('csv-download-request-completed', function (dataUrl) {
      vm.isDownloading = false;
      vm.onStatusChange({
        isExporting: false,
        dataUrl: dataUrl
      });
    });

    function startDownload(csvType, filename) {
      vm.isDownloading = true;
      vm.onStatusChange({
        isExporting: true
      });
      wasCanceled = false;

      $rootScope.$emit('csv-download-begin');

      CsvDownloadService.getCsv(csvType, vm.isOverExportThreshold, filename)
        .then(function (url) {
          downloadSuccess(csvType, url, filename);
        })
        .catch(function (response) {
          downloadFailure(response);
        });
    }

    function setAnchorData(url, filename) {
      if (blobAnchor) {
        blobAnchor.attr('href', url);
        blobAnchor.attr('download', filename);
      }
    }

    function downloadSuccess(csvType, url, filename) {
      // trigger the file save
      setAnchorData(url, filename);

      if (useIEBlobSave) {
        // this opens the save/open dialog in IE
        CsvDownloadService.openInIE(csvType, filename);
      } else {
        // click the anchor to trigger the file save
        if (blobAnchor) {
          blobAnchor[0].click();
        }
      }

      $timeout(function () {
        if (csvType !== CsvDownloadService.typeTemplate) {
          CsvDownloadService.revokeObjectUrl();
        }

        vm.isDownloading = false;
        vm.onStatusChange({
          isExporting: false,
          dataUrl: url
        });

        setAnchorData('', '');

        var title = '<span class="toast-title">' + $translate.instant('userManage.bulk.exportSuccessTitle') + '</span>';
        var str = $translate.instant('userManage.bulk.exportSuccessBody', {
          type: csvType,
          filename: filename
        });

        Notification.notify([title, str], 'success');
        $rootScope.$emit('csv-download-end');
      });
    }

    function downloadFailure(response) {
      wasCanceled = false;
      vm.isDownloading = false;
      vm.onStatusChange({
        isExporting: false
      });
      $rootScope.$emit('csv-download-end');
      if (!wasCanceled) {
        // error came from a non-cancel event.
        Notification.errorResponse(response, 'firstTimeWizard.downloadError');
      }
    }

    function cancelDownload() {
      wasCanceled = true;
      CsvDownloadService.cancelDownload();
      Notification.warning('userManage.bulk.canceledExport');
    }

  }

})();
