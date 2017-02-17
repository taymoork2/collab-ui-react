(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageExportService', DeviceUsageExportService);

  /* @ngInject */
  function DeviceUsageExportService($q, $document, $window, $log, $timeout, $http, Authinfo, UrlConfig) {

    var localUrlBase = 'http://localhost:8080/atlas-server/admin/api/v1/organization';

    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization';

    function exportData(startDate, endDate, api, statusCallback, version_2) {
      var granularity = "day";
      var deviceCategories = ['ce', 'sparkboard', 'Novum'];
      var baseUrl = '';
      if (api === 'mock') {
        $log.info("Not implemented export for mock data");
        return;
      }
      if (api === 'local') {
        baseUrl = localUrlBase;
      } else {
        baseUrl = urlBase;
      }

      //TODO: Fix when releasing V2
      var url = baseUrl + '/' + Authinfo.getOrgId() + '/reports/device/call/export?';
      url = url + 'intervalType=' + granularity;
      url = url + '&rangeStart=' + startDate + '&rangeEnd' + endDate;
      url = url + '&deviceCategories=' + deviceCategories.join();
      url = url + '&accounts=__';
      url = url + '&sendMockData=false';

      if (version_2) {
        url = 'http://berserk.rd.cisco.com:8080/atlas-server/admin/api/v1/organization' + '/' + Authinfo.getOrgId() + '/reports/device/usage/export?';
        url = url + 'interval=' + granularity;
        url = url + '&from=' + startDate + '&to' + endDate;
        url = url + '&categories=' + deviceCategories.join();
        url = url + '&countryCodes=aggregate';
        url = url + '&models=__';
        //url = url + '&sendMockData=false';
      }

      $log.info("Trying to export data using url:", url);
      return downloadReport(url, statusCallback);
    }

    var exportCanceler;
    function downloadReport(url, statusCallback) {
      exportCanceler = $q.defer();
      return $http.get(url, {
        responseType: 'arraybuffer',
        timeout: exportCanceler.promise
      }).success(function (data) {
        var fileName = 'device-usage.csv';
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
      cancelExport: cancelExport
    };
  }
}());
