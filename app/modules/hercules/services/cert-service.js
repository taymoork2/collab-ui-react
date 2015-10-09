(function () {
  'use strict';

  /*ngInject*/
  function CertService($http, ConfigService, Utils, $q) {

    function extractData(res) {
      return res.data;
    }

    function getCerts(orgId) {
      return $http
        .get(ConfigService.getCertsUrl() + '/certificates?orgId=' + orgId)
        .then(extractData);
    }

    function uploadCert(orgId, file) {
      var deferred = $q.defer();
      var reader = new FileReader();
      reader.onloadend = function () {
        $http.post(ConfigService.getCertsUrl() + '/certificates?orgId=' + orgId, {
            cert: Utils.Base64.encode(reader.result)
          })
          .then(deferred.resolve, deferred.reject);
      };
      reader.readAsBinaryString(file);
      return deferred.promise;
    }

    function deleteCert(certId) {
      return $http.delete(ConfigService.getCertsUrl() + '/certificates/' + certId);
    }

    return {
      getCerts: getCerts,
      uploadCert: uploadCert,
      deleteCert: deleteCert
    };
  }

  angular.module('Hercules').service('CertService', CertService);
}());
