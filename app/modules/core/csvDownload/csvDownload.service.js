(function () {
  'use strict';

  angular.module('Core')
    .service('CsvDownloadService', CsvDownloadService);

  /* @ngInject */
  function CsvDownloadService(Authinfo, $window, $http, $q, UrlConfig, Utils, UserListService, UserCsvService) {
    var objectUrl;
    var objectUrlTemplate;
    var typeTemplate = 'template';
    var typeUser = 'user';
    var typeHeaders = 'headers';
    var typeExport = 'export';
    var typeAny = 'any';
    var typeError = 'error';
    var userExportUrl = UrlConfig.getAdminServiceUrl() + 'csv/organizations/' + Authinfo.getOrgId() + '/users/%s';
    var downloadInProgress = false;
    var isTooManyUsers = false;
    var canceler, objectBlob, templateBlob;
    var userExportThreshold = 10000;

    var service = {
      typeTemplate: typeTemplate,
      typeUser: typeUser,
      typeAny: typeAny,
      typeError: typeError,
      userExportThreshold: userExportThreshold,
      getCsv: getCsv,
      openInIE: openInIE,
      createObjectUrl: createObjectUrl,
      revokeObjectUrl: revokeObjectUrl,
      getObjectUrl: getObjectUrl,
      setObjectUrl: setObjectUrl,
      getObjectUrlTemplate: getObjectUrlTemplate,
      setObjectUrlTemplate: setObjectUrlTemplate,
      downloadInProgress: downloadInProgress,
      cancelDownload: cancelDownload
    };

    return service;

    function getCsv(csvType, tooManyUsers, fileName) {
      tooManyUsers = _.isBoolean(tooManyUsers) ? tooManyUsers : false;
      isTooManyUsers = tooManyUsers;
      if (tooManyUsers) {
        canceler = UserListService.exportCSV().then(function (csvData) {
          var csvString = $.csv.fromObjects(csvData, {
            headers: false
          });
          return createObjectUrl(csvString, csvType, fileName);
        });
        return canceler;
      } else {
        var url = '';
        if (csvType === typeUser) {
          url = Utils.sprintf(userExportUrl, [typeExport]);
          canceler = $q.defer();
          return $http.get(url, {
            timeout: canceler.promise
          }).then(function (csvData) {
            return createObjectUrl(csvData.data, csvType, fileName);
          }).finally(function () {
            canceler = undefined;
          });
        } else if (csvType === typeError) {
          return $q(function (resolve, reject) {
            var csvErrorArray = UserCsvService.getCsvStat().userErrorArray;
            var csvString = $.csv.fromObjects(_.union([{
              row: 'Row Number',
              email: 'User ID/Email',
              error: 'Error Message'
            }], csvErrorArray), {
              headers: false
            });
            resolve(createObjectUrl(csvString, csvType, fileName));
          });
        } else {
          url = Utils.sprintf(userExportUrl, [csvType]);
          return $http.get(url).then(function (csvData) {
            if (csvType === typeHeaders) {
              return csvData.data;
            } else {
              return createObjectUrl(csvData.data, csvType, fileName);
            }
          });
        }
      }
    }

    function cancelDownload() {
      if (!isTooManyUsers) {
        if (canceler) {
          canceler.resolve();
        }
      }
    }

    function createObjectUrl(data, type, fileName) {
      var blob = new $window.Blob([data], {
        type: 'text/plain'
      });
      var oUrl = ($window.URL || $window.webkitURL).createObjectURL(blob);
      if (type === typeTemplate) {
        templateBlob = blob;
        setObjectUrlTemplate(oUrl);
      } else {
        objectBlob = blob;
        setObjectUrl(oUrl);
      }

      // IE download option since IE won't download the created url
      if ($window.navigator.msSaveOrOpenBlob) {
        openInIE(type, fileName);
      }

      return oUrl;
    }

    function openInIE(type, fileName) {
      if (type === typeTemplate && templateBlob) {
        $window.navigator.msSaveOrOpenBlob(templateBlob, fileName);
      } else if (type !== typeTemplate && objectBlob) {
        $window.navigator.msSaveOrOpenBlob(objectBlob, fileName);
      }
    }

    function revokeObjectUrl() {
      if (getObjectUrl()) {
        ($window.URL || $window.webkitURL).revokeObjectURL(getObjectUrl());
        setObjectUrl(null);
        objectBlob = null;
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
  }

})();
