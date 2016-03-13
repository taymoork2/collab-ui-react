(function () {
  'use strict';

  angular.module('Core')
    .service('CsvDownloadService', CsvDownloadService);

  /* @ngInject */
  function CsvDownloadService(Authinfo, $resource, UrlConfig) {
    var objectUrl;
    var objectUrlTemplate;
    var typeTemplate = 'template';
    var typeUser = 'user';
    var typeHeaders = 'headers';
    var typeExport = 'export';
    var csvUserResource = $resource(UrlConfig.getAdminServiceUrl() + 'csv/organizations/' + Authinfo.getOrgId() + '/users/:type', {
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
    });

    var service = {
      typeTemplate: typeTemplate,
      typeUser: typeUser,
      getCsv: getCsv,
      createObjectUrl: createObjectUrl,
      revokeObjectUrl: revokeObjectUrl,
      getObjectUrl: getObjectUrl,
      setObjectUrl: setObjectUrl,
      getObjectUrlTemplate: getObjectUrlTemplate,
      setObjectUrlTemplate: setObjectUrlTemplate
    };

    return service;

    function getCsv(type) {
      if (type === typeTemplate) {
        return csvUserResource.get({
          type: typeTemplate
        }).$promise;
      } else if (type === typeUser) {
        return csvUserResource.get({
          type: typeExport
        }).$promise;
      } else if (type === typeHeaders) {
        return csvUserResource.get({
          type: typeHeaders
        }).$promise;
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
