(function () {
  'use strict';

  angular.module('Core')
    .service('CsvDownloadService', CsvDownloadService);

  /* @ngInject */
  function CsvDownloadService(Authinfo, Config, $http, UrlConfig) {
    var objectUrl;
    var objectUrlTemplate;
    var typeTemplate = 'template';
    var typeUser = 'user';
    var typeHeaders = 'headers';
    var csvTemplateUrl = UrlConfig.getAdminServiceUrl() + 'csv/organizations/' + Authinfo.getOrgId() + '/users/template';
    var csvUserDataUrl = UrlConfig.getAdminServiceUrl() + 'csv/organizations/' + Authinfo.getOrgId() + '/users/export';
    var csvHeadersUrl = UrlConfig.getAdminServiceUrl() + 'csv/organizations/' + Authinfo.getOrgId() + '/users/headers';

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
        return $http.get(csvTemplateUrl);
      } else if (type === typeUser) {
        return $http.get(csvUserDataUrl);
      } else if (type === typeHeaders) {
        return $http.get(csvHeadersUrl);
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

    function getHeaders() {

    }
  }

})();
