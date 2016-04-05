(function () {
  'use strict';

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

      var logMsg = "";

      logMsg = "WebExCsvDownloadService().getWebExCsv()" + "\n" +
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

    function createObjectUrl(
      data,
      type
    ) {

      var blob = new Blob([data], {
        type: 'text/plain'
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

      webexCsvResource = $resource(
        fileDownloadUrlFixed, {}, {
          get: {
            method: 'POST',
            // override transformResponse function because $resource
            // returns string array in the case of CSV file download
            transformResponse: function (data, headers) {
                var noTabData = data.replace(/\t/g, ',');
                var resultData = {
                  content: noTabData
                };

                return resultData;
              } // transformResponse()
          } // get
        }
      );
    } // createWebexCsvResource()
  } // WebExCsvDownloadService()
})();
