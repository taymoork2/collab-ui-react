(function () {
  'use strict';

  angular.module('Core')
    .controller('csvDownloadCtrl', csvDownloadCtrl)
    .directive('csvDownload', csvDownload);

  /* @ngInject */
  function csvDownloadCtrl($scope, CsvDownloadService, Notification) {
    /*jshint validthis: true */
    var vm = this;
    vm.downloadCsv = downloadCsv;
    vm.downloading = false;

    function downloadCsv() {
      if (vm.type && (vm.type === CsvDownloadService.typeTemplate || vm.type === CsvDownloadService.typeUser)) {
        $scope.$emit('download-start');
        CsvDownloadService.getCsv(vm.type).then(function (csvData) {
          var objectUrl = CsvDownloadService.createObjectUrl(csvData.content, vm.type);
          $scope.$emit('downloaded', objectUrl);
        }).catch(function (response) {
          Notification.errorResponse(response, 'firstTimeWizard.downloadError');
        });
      }
    }
  }

  /* @ngInject */
  function csvDownload($compile, $timeout, CsvDownloadService) {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/core/csvDownload/csvDownload.tpl.html',
      scope: {
        type: '@',
        downloading: '@'
      },
      controller: csvDownloadCtrl,
      controllerAs: 'csvDownload',
      bindToController: true,
      link: link
    };

    return directive;

    function link(scope, element, attrs) {
      // disable the button when download starts
      scope.$on('download-start', function () {
        scope.csvDownload.downloading = true;
        var anchor = angular.element('#download-csv-' + scope.csvDownload.type);
        anchor.attr('disabled', 'disabled');
      });

      // pass the objectUrl to the href of anchor when download is done
      scope.$on('downloaded', function (event, url) {
        scope.csvDownload.downloading = false;
        var anchor = angular.element('#download-csv-' + scope.csvDownload.type);
        changeAnchorAttrToDownload(url);

        $timeout(function () {
          anchor[0].click();
        });
        $timeout(function () {
          // Remove the object URL if not template
          if (scope.csvDownload.type !== CsvDownloadService.typeTemplate) {
            CsvDownloadService.revokeObjectUrl();
            changeAnchorAttrToOriginalState();
          }
        }, 500);
      });

      // set the icon
      if (attrs.icon) {
        var i = angular.element('#download-icon');
        i.removeClass('icon-circle-download').addClass(attrs.icon);
      }

      // if the template Object URL is already loaded, change the anchor's attributes to download from blob
      if (scope.csvDownload.type && scope.csvDownload.type === 'template' && CsvDownloadService.getObjectUrlTemplate()) {
        changeAnchorAttrToDownload(CsvDownloadService.getObjectUrlTemplate());
      }

      function changeAnchorAttrToDownload(url) {
        $timeout(function () {
          var anchor = angular.element('#download-csv-' + scope.csvDownload.type);
          scope.csvDownload.tempFunction = scope.csvDownload.downloadCsv || angular.noop;
          scope.csvDownload.downloadCsv = angular.noop;
          anchor.attr({
              href: url,
              download: attrs.filename
            })
            .removeAttr('disabled');
        });
      }

      function changeAnchorAttrToOriginalState() {
        $timeout(function () {
          var anchor = angular.element('#download-csv-' + scope.csvDownload.type);
          scope.csvDownload.downloadCsv = scope.csvDownload.tempFunction || angular.noop;
          anchor.attr({
              href: ''
            })
            .removeAttr('download');
        });
      }
    }

  }

})();
