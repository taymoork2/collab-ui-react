require('./_user-csv.scss');

(function () {
  'use strict';

  angular.module('Core')
    .component('crUserCsvExport', {
      controller: UserCsvExportController,
      templateUrl: 'modules/core/users/userCsv/userCsvExport.tpl.html',
      bindings: {
        onStatusChange: '&',
        isOverExportThreshold: '<',
        useCsvDownloadDirective: '<',
        asLink: '@'
      }
    });

  /////////////////
  /* @ngInject */
  function UserCsvExportController($scope, $rootScope, $modal, $translate, $timeout, $window, $element, Analytics, CsvDownloadService, Notification) {
    var vm = this;

    vm.$onInit = onInit;
    vm.$postLink = postLink;
    vm.$onDestroy = onDestroy;
    vm.exportCsv = exportCsv;
    vm.downloadTemplate = downloadTemplate;
    vm.cancelDownload = cancelDownload;
    vm.displayAsLink = !_.isEmpty(vm.asLink);

    ////////////////
    var exportFilename;
    var blobAnchor;
    var wasCanceled;
    var useIEBlobSave;
    var eventListeners = [];

    function onInit() {
      vm.isDownloading = CsvDownloadService.downloadInProgress;
      vm.isOverExportThreshold = !!(vm.isOverExportThreshold);
      vm.useCsvDownloadDirective = !!(vm.useCsvDownloadDirective);

      exportFilename = $translate.instant('usersPage.csvFilename');
      wasCanceled = false;
      useIEBlobSave = !_.isUndefined($window.navigator.msSaveOrOpenBlob);

      eventListeners.push($rootScope.$on('csv-download-request-started', onCsvDownloadRequestStarted));
      eventListeners.push($rootScope.$on('csv-download-request-completed', onCsvDownloadRequestCompleted));
    }

    function postLink() {
      blobAnchor = $element.find('.download-anchor');
    }

    function onDestroy() {
      while (!_.isEmpty(eventListeners)) {
        _.attempt(eventListeners.pop());
      }
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
      Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.EXPORT_USER_LIST);
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

    function onCsvDownloadRequestStarted() {
      vm.isDownloading = true;
      vm.onStatusChange({
        isExporting: true
      });
    }

    function onCsvDownloadRequestCompleted(dataUrl) {
      vm.isDownloading = false;
      vm.onStatusChange({
        isExporting: false,
        dataUrl: dataUrl
      });
    }

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

        Notification.success('userManage.bulk.exportSuccessBody', {
          type: csvType,
          filename: filename
        }, 'userManage.bulk.exportSuccessTitle');
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
