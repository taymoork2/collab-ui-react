(function () {
  'use strict';

  angular.module('Core')
    .directive('csvDownload', csvDownload);

  /* Sample usage:
   *  <csv-download type="any" filename="exported_file.csv" no-icon></csv-download>
   *    - $emit event 'csv-download-request' and pass in download type
   *  <csv-download type="template" filename="template.csv"></csv-download>
   *    - static download type
   *    - call scope.downloadCsv()
   * /
  /* @ngInject */
  function csvDownload($rootScope, $q, $translate, $timeout, $modal, CsvDownloadService, Notification) {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/core/csvDownload/csvDownload.tpl.html',
      scope: {
        type: '@',
        filename: '@'
      },
      link: link
    };

    return directive;

    function link(scope, element, attrs) {
      var FILENAME = 'exported_file.csv';

      scope.downloading = false;
      scope.downloadingMessage = '';
      scope.type = scope.type || CsvDownloadService.typeAny;
      scope.downloadCsv = downloadCsv;
      var downloadAnchor = $(element.find('a')[0]);
      var downloadIcon = $(element.find('i')[0]);
      var downloadingIcon = $(element.find('i')[1]);

      function downloadCsv(csvType, tooManyUsers) {
        csvType = csvType || scope.type;

        if (csvType === CsvDownloadService.typeTemplate || csvType === CsvDownloadService.typeUser) {
          startDownload(csvType);
          CsvDownloadService.getCsv(csvType, tooManyUsers, scope.filename).then(function (url) {
            finishDownload(csvType, url);
          }).catch(function (response) {
            if (response.status !== -1) {
              Notification.errorResponse(response, 'firstTimeWizard.downloadError');
            }
            flagDownloading(false);
            changeAnchorAttrToOriginalState();
          });
        }
      }

      function startDownload(csvType) {
        // disable the button when download starts
        flagDownloading(true);
        scope.downloadingMessage = $translate.instant('csvDownload.csvDownloadInProgress', {
          type: csvType
        });
        $timeout(function () {
          downloadAnchor.attr('disabled', 'disabled');
          if (scope.type === CsvDownloadService.typeAny) {
            downloadingIcon.mouseover();
            $timeout(function () {
              downloadingIcon.mouseout();
            }, 3000);
          }
        });
      }

      function finishDownload(csvType, url) {
        // pass the objectUrl to the href of anchor when download is done
        changeAnchorAttrToDownloadState(url);

        $timeout(function () {
          if (scope.downloading) {
            if (scope.type === CsvDownloadService.typeAny) {
              downloadingIcon.mouseout();
            }
            if (angular.isUndefined(window.navigator.msSaveOrOpenBlob)) {
              // in IE this causes the page to refresh
              downloadAnchor[0].click();
            }
            Notification.success('csvDownload.csvDownloadSuccess', {
              type: csvType
            });
            flagDownloading(false);
          }
        });
        $timeout(function () {
          // remove the object URL if it's not a template
          if (scope.type !== CsvDownloadService.typeTemplate) {
            CsvDownloadService.revokeObjectUrl();
            changeAnchorAttrToOriginalState();
          }
        }, 500);
      }

      function changeAnchorAttrToDownloadState(url) {
        $timeout(function () {
          // scope.tempFunction = scope.downloadCsv;
          scope.downloadCsv = removeFocus;

          if (angular.isUndefined(window.navigator.msSaveOrOpenBlob)) {
            downloadAnchor.attr({
              href: url,
              download: scope.filename || FILENAME
            })
            .removeAttr('disabled');
          } else {
            // IE download option since IE won't download the created url
            scope.downloadCsv = openInIE;
          }
        });
      }

      function openInIE() {
        CsvDownloadService.openInIE(scope.type, scope.filename || FILENAME);
      }

      function changeAnchorAttrToOriginalState() {
        $timeout(function () {
          scope.downloadCsv = downloadCsv;
          downloadAnchor.attr({
              href: ''
            })
            .removeAttr('download');
        });
      }

      function removeFocus() {
        $timeout(function () {
          downloadAnchor.blur();
        });
      }

      function flagDownloading(flag) {
        flag = _.isBoolean(flag) ? flag : false;
        scope.downloading = flag;
        if (scope.type === CsvDownloadService.typeAny) {
          CsvDownloadService.downloadInProgress = flag;
        }
      }

      function cancelDownload() {
        var deferred = $q.defer();
        if (CsvDownloadService.downloadInProgress) {
          CsvDownloadService.cancelDownload();
          flagDownloading(false);
          changeAnchorAttrToOriginalState();
          $timeout(function () {
            deferred.resolve();
          }, 1000);
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      }

      // dynamic CSV download
      if (attrs.type === CsvDownloadService.typeAny) {
        $rootScope.$on('csv-download-request', function (event, csvType, tooManyUsers) {
          tooManyUsers = _.isBoolean(tooManyUsers) ? tooManyUsers : false;
          if (tooManyUsers && CsvDownloadService.downloadInProgress) {
            Notification.error('csvDownload.csvDownloadIsRunning');
          } else {
            $modal.open({
              templateUrl: 'modules/core/csvDownload/csvDownloadConfirm.tpl.html',
              controller: function () {
                var vm = this;
                vm.messageBody1 = CsvDownloadService.downloadInProgress ? $translate.instant('csvDownload.confirmCsvCancelMsg') : '';
                vm.messageBody2 = $translate.instant('csvDownload.confirmCsvDownloadMsg');
              },
              controllerAs: 'csv'
            }).result.then(function () {
              cancelDownload().then(function () {
                scope.downloadCsv(csvType, tooManyUsers);
              });
            });
          }
        });
      }

      // if icon attribute is defined, set the icon
      if (attrs.icon) {
        downloadIcon.removeClass('icon-circle-download').addClass(attrs.icon);
      } else if (angular.isDefined(attrs.noIcon)) {
        downloadIcon.removeClass('icon-circle-download');
      }

      // if the template Object URL is already loaded, change the anchor's attributes to download from blob
      if (attrs.type && attrs.type === 'template' && CsvDownloadService.getObjectUrlTemplate()) {
        changeAnchorAttrToDownloadState(CsvDownloadService.getObjectUrlTemplate());
      }
    }

  }

})();
