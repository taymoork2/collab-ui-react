require('./_csv-download.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('csvDownloadController', csvDownloadController)
    .directive('csvDownload', csvDownloadDirective);

  /* Sample usage:
   *  <csv-download type="any" filename="exported_file.csv" no-icon></csv-download>
   *    - $emit event 'csv-download-request' and pass in options object containing
   *    --- { csvType, tooManyUsers, suppressWarning, filename}
   *  <csv-download type="template" filename="template.csv"></csv-download>
   *    - static download type
   *    - call $scope.downloadCsv()
   * /
   /* @ngInject */
  function csvDownloadDirective() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/core/csvDownload/csvDownload.tpl.html',
      scope: {
        type: '@',
        filename: '@',
        statusMessage: '@',
        downloadState: '@'
      },
      link: link,
      controller: 'csvDownloadController',
      controllerAs: '$ctrl'
    };
    return directive;

    function link(scope, element, attrs) {
      var downloadIcon = $(element.find('i')[0]);

      // if icon attribute is defined, set the icon
      if (attrs.icon) {
        downloadIcon.removeClass('icon-circle-download').addClass(attrs.icon);
      } else if (!_.isUndefined(attrs.noIcon)) {
        downloadIcon.removeClass('icon-circle-download');
      }

      if (attrs.anchorText) {
        var downloadAnchor = $(element.find('a')[0]);
        downloadAnchor.html(attrs.anchorText);
      }
    }

  }

  /* @ngInject */
  function csvDownloadController($scope, $element, $rootScope, $window, $q, $translate, $timeout, $modal, $state, CsvDownloadService, Notification, FeatureToggleService) {
    var vm = this;

    $scope.downloading = false;
    $scope.downloadingMessage = '';
    $scope.type = $scope.type || CsvDownloadService.typeAny;
    $scope.downloadCsv = downloadCsv;
    $scope.goToDownload = goToDownload;
    $scope.newUserExportToggle = false;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    FeatureToggleService.atlasNewUserExportGetStatus().then(function (result) {
      $scope.newUserExportToggle = result;
    });

    ////////////////////
    var FILENAME = $scope.filename || 'exported_file.csv';
    var downloadAnchor = $($element.find('a')[0]);
    var downloadingIcon = $($element.find('i')[1]);
    var eventListeners = [];

    function goToDownload() {
      if ($scope.downloading && !_.isEmpty($scope.downloadState)) {
        $state.go($scope.downloadState);
      }
    }

    function downloadCsv(csvType, tooManyUsers) {
      csvType = csvType || $scope.type;

      if (csvType === CsvDownloadService.typeTemplate || csvType === CsvDownloadService.typeUser || csvType === CsvDownloadService.typeError) {
        startDownload(csvType);
        CsvDownloadService.getCsv(csvType, tooManyUsers, FILENAME, $scope.newUserExportToggle).then(function (url) {
          finishDownload(csvType, url);
        }).catch(function (response) {
          if ((_.isString(response) && response !== 'canceled')
            || (_.isNumber(response.status)
              && (response.status !== -1 || (csvType === CsvDownloadService.typeUser && !CsvDownloadService.isReportCanceled())))) {
            Notification.errorWithTrackingId(response, 'csvDownload.error');
          }
          flagDownloading(false);
          changeAnchorAttrToOriginalState();
        });
      }
    }

    function startDownload(csvType) {
      // disable the button when download starts
      flagDownloading(true);
      $scope.downloadingMessage = $translate.instant('csvDownload.inProgress', {
        type: csvType
      });
      $timeout(function () {
        downloadAnchor.attr('disabled', 'disabled');
        if ($scope.type === CsvDownloadService.typeAny) {
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
        if ($scope.downloading) {
          if ($scope.type === CsvDownloadService.typeAny) {
            downloadingIcon.mouseout();
          }
          if (_.isUndefined($window.navigator.msSaveOrOpenBlob)) {
            // in IE this causes the page to refresh
            downloadAnchor[0].click();
          }
          Notification.success('csvDownload.success', {
            type: csvType
          });
          flagDownloading(false);
        }
      });
      $timeout(function () {
        // remove the object URL if it's not a template
        if ($scope.type !== CsvDownloadService.typeTemplate) {
          CsvDownloadService.revokeObjectUrl();
          changeAnchorAttrToOriginalState();
        }
      }, 500);
    }

    function changeAnchorAttrToDownloadState(url) {
      $timeout(function () {
        if (_.isUndefined($window.navigator.msSaveOrOpenBlob)) {
          $scope.downloadCsv = removeFocus;
          downloadAnchor.attr({
            href: url,
            download: FILENAME
          })
            .removeAttr('disabled');
        } else {
          // IE download option since IE won't download the created url
          $scope.downloadCsv = openInIE;
          downloadAnchor.removeAttr('disabled');
        }
      });
    }

    function openInIE() {
      CsvDownloadService.openInIE($scope.type, FILENAME);
    }

    function changeAnchorAttrToOriginalState() {
      $timeout(function () {
        $scope.downloadCsv = downloadCsv;
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
      $scope.downloading = flag;
      if ($scope.type === CsvDownloadService.typeAny) {
        CsvDownloadService.downloadInProgress = flag;
      }

      if (flag) {
        $rootScope.$emit('csv-download-request-started');
      } else {
        $rootScope.$emit('csv-download-request-completed', {
          dataUrl: FILENAME
        });
      }

    }

    function cancelDownload() {
      return $q(function (resolve) {
        if (CsvDownloadService.downloadInProgress) {
          CsvDownloadService.cancelDownload();
          flagDownloading(false);
          changeAnchorAttrToOriginalState();
          $timeout(function () {
            resolve();
          }, 1000);
        } else {
          resolve();
        }
      });
    }

    function onInit() {

      // if the template Object URL is already loaded, change the anchor's attributes to download from blob
      if ($scope.type === CsvDownloadService.typeUser) {
        $scope.tooltipMessage = $translate.instant('usersPage.csvBtnTitle');
      }

      if ($scope.type && $scope.type === 'template' && CsvDownloadService.getObjectUrlTemplate()) {
        changeAnchorAttrToDownloadState(CsvDownloadService.getObjectUrlTemplate());
      }

      eventListeners.push($rootScope.$on('csv-download-begin', function () {
        flagDownloading(true);
      }));

      eventListeners.push($rootScope.$on('csv-download-end', function () {
        flagDownloading(false);
      }));

      // dynamic CSV download
      if ($scope.type === CsvDownloadService.typeAny) {
        eventListeners.push($rootScope.$on('csv-download-request', function (event, options) {
          FILENAME = (options.filename || FILENAME);
          var tooManyUsers = !!options.tooManyUsers;
          if (tooManyUsers && CsvDownloadService.downloadInProgress) {
            Notification.error('csvDownload.isRunning');
          } else {
            if (options.suppressWarning) {
              // don't warn user, just start export
              $scope.downloadCsv(options.csvType, tooManyUsers);
            } else {
              // warn user this might take a while and get confirmation
              $modal.open({
                type: 'dialog',
                templateUrl: 'modules/core/csvDownload/csvDownloadConfirm.tpl.html',
                controller: function () {
                  var vm = this;
                  vm.messageBody1 = CsvDownloadService.downloadInProgress ? $translate.instant('csvDownload.confirmCsvCancelMsg') : '';
                  vm.messageBody2 = $translate.instant('csvDownload.confirmCsvDownloadMsg');
                },
                controllerAs: 'csv'
              }).result.then(function () {
                cancelDownload().then(function () {
                  $scope.downloadCsv(options.csvType, tooManyUsers);
                });
              });
            }
          }
        }));
      }
    }

    function onDestroy() {
      while (!_.isEmpty(eventListeners)) {
        _.attempt(eventListeners.pop());
      }
    }
  }

})();
