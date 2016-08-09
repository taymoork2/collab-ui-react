(function () {
  'use strict';

  angular.module('Hercules')
    .service('ExcelService', ExcelService);

  // Really, it creates CSV file formated for Excel more than real Excel files
  // Opinionated: utf-8 only, expect “,” to be the separator

  /* @ngInject */
  function ExcelService($window, $document, $timeout) {
    // Improve formatting in all versions of Excel even if it means
    // not being 100% CSV-valid
    // See https://github.com/asafdav/ng-csv/issues/28
    var EOL = '\r\n';
    var separator = ',';
    var firstLine = 'sep=' + separator + EOL;
    var service = {
      createFile: createFile,
      downloadFile: downloadFile
    };

    return service;

    function createFile(header, content) {
      var csvContent = firstLine;
      // Check if there's a provided header array
      if (angular.isArray(header)) {
        var headerString = stringifyArray(header);
        csvContent += headerString + EOL;
      }
      var contentString = _.chain(content)
        .map(function (row) {
          return stringifyArray(row);
        })
        .join(EOL)
        .value();
      csvContent += contentString;
      return csvContent;
    }

    function downloadFile(filename, textContent) {
      var blob = new $window.Blob([textContent], {
        type: 'text/csv;charset=utf-8;'
      });

      if ($window.navigator.msSaveOrOpenBlob) {
        // IE…
        $window.navigator.msSaveOrOpenBlob(blob, filename);
      } else if (!('download' in $window.document.createElement('a'))) {
        // Safari…
        $window.location.href = $window.URL.createObjectURL(blob);
      } else {
        var downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
        var downloadLink = angular.element(downloadContainer.children()[0]);
        downloadLink.attr({
          'href': $window.URL.createObjectURL(blob),
          'download': filename,
          'target': '_blank'
        });
        $document.find('body').append(downloadContainer);
        $timeout(function () {
          downloadLink[0].click();
          downloadLink.remove();
        });
      }
    }

    function stringifyArray(row) {
      return _.chain(row)
        .map(function (cell) {
          return stringifyField(cell);
        })
        .join(separator)
        .value();
    }

    function stringifyField(data) {
      if (angular.isString(data)) {
        // Escape double quotes
        data = data.replace(/"/g, '""');
        if (data.indexOf(separator) > -1 || data.indexOf('\n') > -1 || data.indexOf('\r') > -1) {
          data = '"' + data + '"';
        }
      } else if (typeof data === 'boolean') {
        data = data ? 'TRUE' : 'FALSE';
      }
      return data;
    }
  }
})();
