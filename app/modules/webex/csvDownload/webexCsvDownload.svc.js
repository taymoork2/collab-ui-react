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

      var intBytes = [];

      var utf16leHeader = '%ff%fe';

      utf16leHeader.replace(/([0-9a-f]{2})/gi, function (byte) {
        intBytes.push(parseInt(byte, 16));
      });

      for (var i = 0; i < data.length; ++i) {
        var hexByte = null;
        var intByte = null;

        hexByte = data[i].charCodeAt(0).toString(16);
        intByte = parseInt(hexByte, 16);

        if (25 > i) {
          logMsg = funcName + "\n" +
            "data[" + i + "]=" + data[i] + "\n" +
            "hexByte=" + hexByte + "\n" +
            "intByte=" + intByte;
          // $log.log(logMsg);
        }

        intBytes.push(intByte);

        hexByte = "%00";
        hexByte.replace(/([0-9a-f]{1})/gi, function (hexByte) {
          intByte = parseInt(hexByte, 16);
        });

        intBytes.push(intByte);
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
