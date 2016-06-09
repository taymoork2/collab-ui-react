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

        WebExCsvDownloadService.getWebExCsv(
          vm.fileDownloadUrl
        ).then(
          function getWebExCsvSuccess(csvData) {
            var objectUrl = WebExCsvDownloadService.webexCreateObjectUrl(
              csvData.content,
              vm.fileName);

            $scope.$emit('downloaded', objectUrl);
          }
        ).catch(
          function getWebExCsvCatch(response) {
            Notification.errorResponse(response, 'firstTimeWizard.downloadError');
            $scope.$emit('download-error');
          }
        );
      }
    } // downloadCsv()
  } // webexCsvDownloadCtrl()

  /* @ngInject */
  function webexCsvDownload(
    $log,
    $compile,
    $timeout,
    $window,
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

        var downloadAnchor = angular.element('#download-csv-' + scope.webexCsvDownload.type);

        downloadAnchor.attr('disabled', 'disabled');
      });

      // pass the objectUrl to the href of downloadAnchor when download is done
      scope.$on('downloaded', function (event, url) {

        scope.webexCsvDownload.downloading = false;

        var downloadAnchor = angular.element('#download-csv-' + scope.webexCsvDownload.type);

        changeAnchorAttrToDownload(url);

        $timeout(function () {
          downloadAnchor[0].click();
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

      scope.webexCsvDownload.fileDownloadUrl = attrs.filedownloadurl;
      scope.webexCsvDownload.fileName = attrs.filename;

      function changeAnchorAttrToDownload(url) {
        $timeout(function () {
          $log.log("*******changeAnchorAttrToDownload function******S");
          //  if (_.isUndefined($window.navigator.msSaveOrOpenBlob)) {
          var downloadAnchor = angular.element('#download-csv-' + scope.webexCsvDownload.type);

          scope.webexCsvDownload.tempFunction = scope.webexCsvDownload.downloadCsv || angular.noop;
          scope.webexCsvDownload.downloadCsv = angular.noop;
          // scope.webexCsvDownload = removeFocus;

          downloadAnchor
            .attr({
              href: url,
              download: attrs.filename
            })
            .removeAttr('disabled');
          //    } else {
          //     // IE download option since IE won't download the created url
          //    scope.webexCsvDownload = openInIE;
          //   downloadAnchor.removeAttr('disabled');
          //  }
        });
      } // changeAnchorAttrToDownload()

      function openInIE() {
        WebExCsvDownloadService.openInIE(attrs.filename);
      }

      function changeAnchorAttrToOriginalState() {
        $timeout(function () {
          var downloadAnchor = angular.element('#download-csv-' + scope.webexCsvDownload.type);
          scope.webexCsvDownload.downloadCsv = scope.webexCsvDownload.tempFunction || angular.noop;
          downloadAnchor.attr({
            href: ''
          }).removeAttr('download');
        });
      } // changeAnchorAttrToOriginalState()
    } // link()
  } // webexCsvDownloadCtrl()
})();
