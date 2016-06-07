(function () {
  'use strict';

  /* global Uint8Array:false */

  angular.module('WebExApp').service('WebExCsvDownloadService', WebExCsvDownloadService);

  /* @ngInject */
  function WebExCsvDownloadService(
    $log,
    $resource,
    $window,
    Authinfo,
    UrlConfig,
    WebExUtilsFact
  ) {

    var objectUrl;
    var objectUrlTemplate;

    var typeWebExExport = 'webexexport';
    var typeWebExImport = 'webeximport';
    var objectBlob = null;

    var service = {
      typeWebExExport: typeWebExExport,
      typeWebExImport: typeWebExImport,
      getWebExCsv: getWebExCsv,
      webexCreateObjectUrl: webexCreateObjectUrl,
      openInIE: openInIE,
      revokeObjectUrl: revokeObjectUrl,
      getObjectUrl: getObjectUrl,
      setObjectUrl: setObjectUrl,
      getObjectUrlTemplate: getObjectUrlTemplate,
      setObjectUrlTemplate: setObjectUrlTemplate
    };

    return service;

    function getWebExCsv(
      fileDownloadUrl
    ) {

      var funcName = "WebExCsvDownloadService.getWebExCsv()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "fileDownloadUrl=" + fileDownloadUrl;
      $log.log(logMsg);

      var webexCsvResource = $resource(fileDownloadUrl, {}, {
        get: {
          method: 'POST',
          // override transformResponse function because $resource
          // returns string array in the case of CSV file download
          transformResponse: function (
              data,
              headers
            ) {

              var resultData = {
                content: data
              };

              return resultData;
            } // transformResponse()
        } // get
      }); // $resource()

      return webexCsvResource.get('').$promise;
    } // getWebExCsv()

    function webexCreateObjectUrl(
      data,
      fileName
    ) {
      var funcName = "webexCreateObjectUrl()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "data.length=" + data.length + "\n" +
        "fileName=" + fileName;
      $log.log(logMsg);

      var intBytes = WebExUtilsFact.utf8ToUtf16le(data);

      var newData = new Uint8Array(intBytes);
      // var newData = data;

      var blob = new $window.Blob([newData], {
        // type: 'text/csv;charset=UTF-16LE;'
        type: 'text/plain'
      });

      var oUrl = ($window.URL || $window.webkitURL).createObjectURL(blob);

      setObjectUrl(oUrl);
      objectBlob = blob;

      // IE download option since IE won't download the created url
      if ($window.navigator.msSaveOrOpenBlob) {
        openInIE(fileName);
      }

      return oUrl;
    } // webexCreateObjectUrl()

    function openInIE(fileName) {
      $window.navigator.msSaveOrOpenBlob(
        objectBlob,
        fileName
      );
    } // openInIE()

    function revokeObjectUrl() {
      if (getObjectUrl()) {
        ($window.URL || $window.webkitURL).revokeObjectURL(getObjectUrl());
        setObjectUrl(null);
        objectBlob = null;
      }
    } // revokeObjectUrl()

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
