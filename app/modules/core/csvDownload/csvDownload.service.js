(function () {
  'use strict';

  angular.module('Core')
    .service('CsvDownloadService', CsvDownloadService);

  /* @ngInject */
  function CsvDownloadService(Authinfo, $http, $q, UrlConfig, Utils, UserListService) {
    var objectUrl;
    var objectUrlTemplate;
    var typeTemplate = 'template';
    var typeUser = 'user';
    var typeHeaders = 'headers';
    var typeExport = 'export';
    var typeAny = 'any';
    var userExportUrl = UrlConfig.getAdminServiceUrl() + 'csv/organizations/' + Authinfo.getOrgId() + '/users/%s';
    var downloadInProgress = false;
    var isTooManyUsers = false;
    var canceler;

    var service = {
      typeTemplate: typeTemplate,
      typeUser: typeUser,
      typeAny: typeAny,
      getCsv: getCsv,
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

    function getCsv(csvType, tooManyUsers) {
      tooManyUsers = _.isBoolean(tooManyUsers) ? tooManyUsers : false;
      isTooManyUsers = tooManyUsers;
      var options = null;
      if (tooManyUsers) {
        return UserListService.exportCSV().then(function (csvData) {
          var csvString = $.csv.fromObjects(csvData, {
            headers: false
          });
          return createObjectUrl(csvString, csvType);
        });
      } else {
        var url = '';
        if (csvType === typeUser) {
          url = Utils.sprintf(userExportUrl, [typeExport]);
          canceler = $q.defer();
          return $http.get(url, {
            timeout: canceler.promise
          }).then(function (csvData) {
            return createObjectUrl(csvData.data, csvType);
          }).finally(function () {
            canceler = undefined;
          });
        } else {
          url = Utils.sprintf(userExportUrl, [csvType]);
          return $http.get(url).then(function (csvData) {
            if (csvType === typeHeaders) {
              return csvData.data;
            } else {
              return createObjectUrl(csvData.data, csvType);
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

    function createObjectUrl(data, type) {
      var blob = new Blob([data], {
        type: 'text/plain'
      });
      var oUrl = (window.URL || window.webkitURL).createObjectURL(blob);
      setObjectUrl(oUrl);
      if (type === typeTemplate) {
        setObjectUrlTemplate(oUrl);
      }
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
  }

})();
