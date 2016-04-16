(function () {
  'use strict';

  /* global Uint8Array:false */

  angular.module('WebExApp').service('WebExCsvDownloadService', WebExCsvDownloadService);

  /* @ngInject */
  function WebExCsvDownloadService(
    $log,
    $resource,
    Authinfo,
    UrlConfig
  ) {

    var objectUrl;
    var objectUrlTemplate;

    var typeExport = 'export';
    var typeWebExExport = 'webexexport';
    var typeWebExImport = 'webeximport';

    var webexCsvResource;

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
      typeWebExExport: typeWebExExport,
      typeWebExImport: typeWebExImport,
      getCsv: getCsv,
      getWebExCsv: getWebExCsv,
      createObjectUrl: createObjectUrl,
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

    function getWebExCsv(
      type,
      fileDownloadUrl
    ) {

      var funcName = "getWebExCsv)";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "type=" + type + "\n" +
        "fileDownloadUrl=" + fileDownloadUrl;
      // $log.log(logMsg);

      if (
        (type === typeWebExExport) ||
        (type === typeWebExImport)
      ) {

        createWebexCsvResource(fileDownloadUrl);

        return webexCsvResource.get('').$promise;
      }
    } // getWebExCsv()

    function createObjectUrl(data) {
      var funcName = "createObjectUrl()";
      var logMsg = "";

      var intBytes = [];

      '%ff%fe'.replace(/([0-9a-f]{2})/gi, function (hexByte) {
        var intByte = parseInt(hexByte, 16);

        intBytes.push(intByte);
      });

      for (var i = 0; i < data.length; ++i) {
        var hexByte = data[i].charCodeAt(0).toString(16);
        var intByte = parseInt(hexByte, 16);

        if (2 <= i) {
          intBytes.push(intByte);
        } else {
          logMsg = funcName + "\n" +
            "data[" + i + "]=" + data[i] + "\n" +
            "hexByte=" + hexByte + "\n" +
            "intByte=" + intByte;
          $log.log(logMsg);
        }
      }

      var blobData = [new Uint8Array(intBytes)];

      var blob = new Blob(blobData, {
        type: 'text/csv;charset=UTF-16LE;'
      });

      var oUrl = (window.URL || window.webkitURL).createObjectURL(blob);

      setObjectUrl(oUrl);

      return oUrl;
    }

    function revokeObjectUrl() {
      if (getObjectUrl()) {
        (window.URL || window.webkitURL).revokeObjectURL(getObjectUrl());
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

    function createWebexCsvResource(fileDownloadUrl) {
      var funcName = "WebExCsvDownloadService().createWebexCsvResource()";
      var logMsg = "";

      var fileDownloadUrlFixed = fileDownloadUrl.replace("http:", "https:");

      logMsg = funcName + "\n" +
        "fileDownloadUrl=" + fileDownloadUrl + "\n" +
        "fileDownloadUrlFixed=" + fileDownloadUrlFixed;
      // $log.log(logMsg);

      webexCsvResource = $resource(fileDownloadUrlFixed, {}, {
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
    } // createWebexCsvResource()
  } // WebExCsvDownloadService()
})();
