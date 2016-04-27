(function () {
  'use strict';

  angular.module('WebExApp')
    .controller('webexCsvDownloadCtrl', webexCsvDownloadCtrl)
    .directive('webexCsvDownload', webexCsvDownload);

  /* @ngInject */
  function webexCsvDownloadCtrl(
    $log,
    $scope,
    WebExCsvDownloadService,
    Notification
  ) {

    /*jshint validthis: true */
    var vm = this;

    vm.downloadCsv = downloadCsv;
    vm.downloading = false;

    function downloadCsv() {
      if (vm.type) {
        $scope.$emit('download-start');

        if (vm.type == WebExCsvDownloadService.typeExport) {
          WebExCsvDownloadService.getCsv(
            vm.type
          ).then(
            function (csvData) {
              var objectUrl = WebExCsvDownloadService.createObjectUrl(csvData.content);

              $scope.$emit('downloaded', objectUrl);
            }
          ).catch(
            function (response) {
              Notification.errorResponse(response, 'firstTimeWizard.downloadError');
            }
          );
        } else {
          WebExCsvDownloadService.getWebExCsv(
            vm.fileDownloadUrl
          ).then(
            function (csvData) {
              var objectUrl = WebExCsvDownloadService.webexCreateObjectUrl(csvData.content);

              $scope.$emit('downloaded', objectUrl);
            }
          ).catch(
            function (response) {
              Notification.errorResponse(response, 'firstTimeWizard.downloadError');
              $scope.$emit('download-error');
            }
          );
        }
      }
    } // downloadCsv()
  } // webexCsvDownloadCtrl()

  /* @ngInject */
  function webexCsvDownload(
    $log,
    $compile,
    $timeout,
    WebExCsvDownloadService
  ) {

    var directive = {
      restrict: 'E',
      templateUrl: 'modules/webex/csvDownload/webexCsvDownload.tpl.html',
      scope: {
        type: '@',
        downloading: '@'
      },
      controller: webexCsvDownloadCtrl,
      controllerAs: 'webexCsvDownload',
      bindToController: true,
      link: link
    };

    return directive;

    function link(
      scope,
      element,
      attrs
    ) {

      // disable the button when download starts
      scope.$on('download-start', function () {
        scope.webexCsvDownload.downloading = true;

        var anchor = angular.element('#download-csv-' + scope.webexCsvDownload.type);

        anchor.attr('disabled', 'disabled');
      });

      // pass the objectUrl to the href of anchor when download is done
      scope.$on('downloaded', function (event, url) {
        scope.webexCsvDownload.downloading = false;

        var anchor = angular.element('#download-csv-' + scope.webexCsvDownload.type);

        changeAnchorAttrToDownload(url);

        $timeout(function () {
          anchor[0].click();
        });

        $timeout(
          function () {
            // Remove the object URL
            WebExCsvDownloadService.revokeObjectUrl();
            changeAnchorAttrToOriginalState();
          },
          500
        );
      });

      scope.$on('download-error', function () {
        scope.webexCsvDownload.downloading = false;
        // changeAnchorAttrToOriginalState();
      });

      if (attrs.filedownloadurl) {
        scope.webexCsvDownload.fileDownloadUrl = attrs.filedownloadurl;
      }

      // if the template Object URL is already loaded, change the anchor's attributes to download from blob
      if (scope.webexCsvDownload.type && scope.webexCsvDownload.type === 'template' && WebExCsvDownloadService.getObjectUrlTemplate()) {
        changeAnchorAttrToDownload(WebExCsvDownloadService.getObjectUrlTemplate());
      }

      function changeAnchorAttrToDownload(url) {
        $timeout(function () {
          var anchor = angular.element('#download-csv-' + scope.webexCsvDownload.type);
          scope.webexCsvDownload.tempFunction = scope.webexCsvDownload.downloadCsv || angular.noop;
          scope.webexCsvDownload.downloadCsv = angular.noop;
          anchor.attr({
            href: url,
            download: attrs.filename
          }).removeAttr('disabled');
        });
      } // changeAnchorAttrToDownload()

      function changeAnchorAttrToOriginalState() {
        $timeout(function () {
          var anchor = angular.element('#download-csv-' + scope.webexCsvDownload.type);
          scope.webexCsvDownload.downloadCsv = scope.webexCsvDownload.tempFunction || angular.noop;
          anchor.attr({
            href: ''
          }).removeAttr('download');
        });
      } // changeAnchorAttrToOriginalState()
    } // link()
  } // webexCsvDownloadCtrl()
})();
