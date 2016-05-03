(function () {
  'use strict';

  /* global Uint8Array:false */

  angular.module('WebExApp').service('WebExCsvDownloadService', WebExCsvDownloadService);

  /* @ngInject */
  function WebExCsvDownloadService(
    $log,
    $resource,
    Authinfo,
    UrlConfig,
    $window
  ) {

    var objectUrl;
    var objectUrlTemplate;

    var typeExport = 'export';
    var typeWebExExport = 'webexexport';
    var typeWebExImport = 'webeximport';

    var userCsvUrl = UrlConfig.getAdminServiceUrl() + 'csv/organizations/' + Authinfo.getOrgId() + '/users/:type';
    var csvUserResource = $resource(
      userCsvUrl, {
        type: '@type'
      }, {
        get: {
          method: 'GET',
          // override transformResponse function because $resource
          // returns string array in the case of CSV file download
          transformResponse: function (data, headers) {
            if (_.isString(data)) {
              if (_.startsWith(data, '{') || _.startsWith(data, '[')) {
                data = angular.fromJson(data);
              } else {
                data = {
                  content: data
                };
              }
            }

            return data;
          }
        }
      }
    );

    var service = {
      typeExport: typeExport,
      typeWebExExport: typeWebExExport,
      typeWebExImport: typeWebExImport,
      getCsv: getCsv,
      getWebExCsv: getWebExCsv,
      createObjectUrl: createObjectUrl,
      webexCreateObjectUrl: webexCreateObjectUrl,
      revokeObjectUrl: revokeObjectUrl,
      getObjectUrl: getObjectUrl,
      setObjectUrl: setObjectUrl,
      getObjectUrlTemplate: getObjectUrlTemplate,
      setObjectUrlTemplate: setObjectUrlTemplate
    };

    return service;

    function getCsv(type) {
      return csvUserResource.get({
        type: typeExport
      }).$promise;
    } // getCsv()

    function getWebExCsv(fileDownloadUrl) {
      var funcName = "getWebExCsv)";
      var logMsg = "";

      var fileDownloadUrlFixed = fileDownloadUrl.replace("http:", "https:");

      logMsg = funcName + "\n" +
        "fileDownloadUrl=" + fileDownloadUrl + "\n" +
        "fileDownloadUrlFixed=" + fileDownloadUrlFixed;
      // $log.log(logMsg);

      var webexCsvResource = $resource(fileDownloadUrlFixed, {}, {
        get: {
          method: 'POST',
          // override transformResponse function because $resource
          // returns string array in the case of CSV file download
          transformResponse: function (
              data,
              headers
            ) {

              // var noTabData = data.replace(/\t/g, ',');

              var resultData = {
                // content: noTabData
                content: data
              };

              return resultData;
            } // transformResponse()
        } // get
      }); // $resource()

      return webexCsvResource.get('').$promise;
    } // getWebExCsv()

    function createObjectUrl(data) {
      var blob = new $window.Blob([data], {
        // type: 'text/csv'
        type: 'application/octet-stream'
      });

      var oUrl = ($window.URL || $window.webkitURL).createObjectURL(blob);

      setObjectUrl(oUrl);

      return oUrl;
    } // createObjectUrl()

    function webexCreateObjectUrl(data) {
      var funcName = "webexCreateObjectUrl()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "data.length=" + data.length;
      $log.log(logMsg);

      var intBytes = [];

      var utf16leHeader = '%ff%fe';

      utf16leHeader.replace(/([0-9a-f]{2})/gi, function (byte) {
        intBytes.push(parseInt(byte, 16));
      });

      for (var i = 0; i < data.length; ++i) {
        var hexChar = data[i].charCodeAt(0);

        var hexByte1 = hexChar & 0xff;
        var hexByte2 = (hexChar >> 8) & 0xff;

        var intByte1 = parseInt(hexByte1.toString(16), 16);
        var intByte2 = parseInt(hexByte2.toString(16), 16);

        /*
        if ( (6100 < i) && (6500 > i) ) {
          logMsg = funcName + "\n" +
            "hexChar=" + hexChar + "\n" +
            "hexByte1=" + hexByte1 + "\n" +
            "hexByte2=" + hexByte2 + "\n" +
            "intByte1=" + intByte1 + "\n" +
            "intByte2=" + intByte2 + "\n" +
            "data[" + i + "]=" + data[i];
          $log.log(logMsg);
        }
        */

        intBytes.push(intByte1);
        intBytes.push(intByte2);
      }

      var newData = new Uint8Array(intBytes);
      // var newData = data;

      var blob = new $window.Blob([newData], {
        // type: 'text/csv;charset=UTF-16LE;'
        // type: 'text/csv'
        type: 'text/plain'
      });

      var oUrl = ($window.URL || $window.webkitURL).createObjectURL(blob);

      setObjectUrl(oUrl);

      return oUrl;
    } // webexCreateObjectUrl()

    function revokeObjectUrl() {
      if (getObjectUrl()) {
        ($window.URL || $window.webkitURL).revokeObjectURL(getObjectUrl());
        setObjectUrl(null);
      }
    }

    function getObjectUrl() {
      return objectUrl;
    }

    function setObjectUrl(oUrl) {
      objectUrl = oUrl;
    }

    function getObjectUrlTemplate() {
      return objectUrlTemplate;
    }

    function setObjectUrlTemplate(oUrl) {
      objectUrlTemplate = oUrl;
    }
  } // WebExCsvDownloadService()
})();
