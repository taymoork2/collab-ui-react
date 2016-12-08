(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceExportService', DeviceExportService);

  /* @ngInject */
  function DeviceExportService($q, $document, $window, $log, $timeout, $http, Authinfo) {

    function exportDevices(statusCallback) {
      var deviceCategories = ['ce', 'sparkboard'];
      var localUrlBase = 'http://berserk.rd.cisco.com:8080/atlas-server/admin/api/v1/organization';
      var url = localUrlBase + '/' + Authinfo.getOrgId() + '/reports/device/call/export?';
      url = url + 'intervalType=day';
      url = url + '&rangeStart=' + '2016-08-01' + '&rangeEnd' + '2016-11-20';
      url = url + '&deviceCategories=' + deviceCategories.join();
      url = url + '&accounts=__';
      url = url + '&sendMockData=false';
      $log.warn("Trying to export data using url:", url);
      return exportData(url, statusCallback);
    }

    // Mainly copied from Ediscovery's downloadReport
    // TODO: Find another way ?
    var exportCanceler;
    function exportData(url, statusCallback) {
      exportCanceler = $q.defer();
      $log.warn("downloadReport", url);
      statusCallback(0);
      return $http.get(url, {
        responseType: 'arraybuffer',
        timeout: exportCanceler.promise
      }).success(function (data) {
        var fileName = 'devices.csv';
        var file = new $window.Blob([data], {
          type: 'application/json'
        });
        if ($window.navigator.msSaveOrOpenBlob) {
          // IE
          $window.navigator.msSaveOrOpenBlob(file, fileName);
        } else if (!('download' in $window.document.createElement('a'))) {
          // Safari…
          $window.location.href = $window.URL.createObjectURL(file);
        } else {
          var downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
          var downloadLink = angular.element(downloadContainer.children()[0]);
          downloadLink.attr({
            'href': $window.URL.createObjectURL(file),
            'download': fileName,
            'target': '_blank'
          });
          $document.find('body').append(downloadContainer);
          $timeout(function () {
            downloadLink[0].click();
            downloadLink.remove();
          }, 100);
        }
        statusCallback(100);
      }).error(function (reason) {
        $log.warn("Device export was not successful, reason:", reason);
        statusCallback(-1);
      });
    }

    function cancelExport() {
      exportCanceler.resolve("cancelled");
    }

    return {
      exportDevices: exportDevices,
      cancelExport: cancelExport
    };
  }
}());
