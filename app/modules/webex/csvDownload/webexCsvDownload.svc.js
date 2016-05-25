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

      logMsg = funcName + "\n" +
        "fileDownloadUrl=" + fileDownloadUrl;
      // $log.log(logMsg);

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

    function createObjectUrl(data) {
      var blob = new $window.Blob([data], {
        type: 'text/csv'
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

      var intBytes = WebExUtilsFact.utf8ToUtf16le(data);

      var newData = new Uint8Array(intBytes);
      // var newData = data;

      var blob = new $window.Blob([newData], {
        // type: 'text/csv;charset=UTF-16LE;'
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
