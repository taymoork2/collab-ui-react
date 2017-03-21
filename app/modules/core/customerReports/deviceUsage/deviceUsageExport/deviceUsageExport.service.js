(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageExportService', DeviceUsageExportService);

  /* @ngInject */
  function DeviceUsageExportService($q, $document, $window, $log, $timeout, $http, Authinfo, UrlConfig) {

    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization';

    //TODO: Remove deviceCategories and use aggregate ????
    function exportData(startDate, endDate, api, statusCallback, deviceCategories) {
      var granularity = "day";
      var baseUrl = urlBase;
      if (api === 'mock') {
        $log.info("Not implemented export for mock data");
        return;
      } else if (api === 'local') {
        baseUrl = 'http://berserk.rd.cisco.com:8080/atlas-server/admin/api/v1/organization';
      }
      var url = baseUrl + '/' + Authinfo.getOrgId() + '/reports/device/usage/export?';
      url = url + 'interval=' + granularity;
      url = url + '&from=' + startDate + '&to' + endDate;
      url = url + '&categories=' + deviceCategories.join();
      url = url + '&countryCodes=aggregate';
      url = url + '&models=__';
      return downloadReport(url, statusCallback);
    }

    var exportCanceler;
    function downloadReport(url, statusCallback) {
      exportCanceler = $q.defer();
      return $http.get(url, {
        responseType: 'arraybuffer',
        timeout: exportCanceler.promise,
      }).success(function (data) {
        var fileName = 'device-usage.csv';
        var file = new $window.Blob([data], {
          type: 'application/json',
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
            'target': '_blank',
          });
          $document.find('body').append(downloadContainer);
          $timeout(function () {
            downloadLink[0].click();
            downloadLink.remove();
          }, 100);
        }
        statusCallback(100);
      }).catch(function (error) {
        statusCallback(-1);
        $log.warn("Device usage export was not successful, reason:", error);
      });
    }

    function cancelExport() {
      exportCanceler.resolve("cancelled");
    }

    return {
      exportData: exportData,
      cancelExport: cancelExport,
    };
  }
}());
