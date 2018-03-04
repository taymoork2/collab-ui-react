/* @ngInject */
export function DeviceExportService($q, $document, $window, $log, $timeout, $http, Authinfo, UrlConfig) {
  function exportDevices(statusCallback) {
    const urlBase = UrlConfig.getCsdmServiceUrl();
    const url = urlBase + '/organization/' + Authinfo.getOrgId() + '/devices?checkOnline=false&checkDisplayName=false&type=all';
    return exportData(url, statusCallback);
  }

  // Based on Ediscovery's downloadReport
  let exportCanceler;

  function exportData(url, statusCallback) {
    exportCanceler = $q.defer();
    return $http.get(url, {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'text/csv',
      },
      timeout: exportCanceler.promise,
    }).then(function (response) {
      const data = response.data;
      const fileName = 'devices.csv';
      const file = new $window.Blob([data], {
        type: 'application/json',
      });
      if ($window.navigator.msSaveOrOpenBlob) {
        // IE
        $window.navigator.msSaveOrOpenBlob(file, fileName);
      } else if (!('download' in $window.document.createElement('a'))) {
        // Safari…
        $window.location.href = $window.URL.createObjectURL(file);
      } else {
        const downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
        const downloadLink = angular.element(downloadContainer.children()[0]);
        downloadLink.attr({
          href: $window.URL.createObjectURL(file),
          download: fileName,
          target: '_blank',
        });
        $document.find('body').append(downloadContainer);
        $timeout(function () {
          downloadLink[0].click();
          downloadLink.remove();
        }, 100);
      }
      statusCallback(100);
    }).catch(function (error) {
      $log.warn('Device export was not successful, reason:', error);
      statusCallback(-1);
    });
  }

  function cancelExport() {
    exportCanceler.resolve('cancelled');
  }

  return {
    exportDevices: exportDevices,
    cancelExport: cancelExport,
  };
}

