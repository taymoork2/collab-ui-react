(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('CertService', CertService);

  /* @ngInject */
  function CertService($http, UrlConfig, Utils, $q, $window) {

    var CertsUrl = UrlConfig.getCertsUrl() + 'certificate/api/v1';

    function extractData(res) {
      return res.data;
    }

    function getCerts(orgId) {
      return $http
        .get(CertsUrl + '/certificates?expand=decoded&orgId=' + orgId)
        .then(extractData);
    }

    function uploadCert(orgId, file) {
      var deferred = $q.defer();
      var reader = new $window.FileReader();
      reader.onloadend = function () {
        $http.post(CertsUrl + '/certificates?orgId=' + orgId, {
          cert: Utils.Base64.encode(reader.result)
        })
          .then(deferred.resolve, deferred.reject);
      };
      reader.readAsBinaryString(file);
      return deferred.promise;
    }

    function deleteCert(certId) {
      return $http.delete(CertsUrl + '/certificates/' + certId);
    }

    return {
      getCerts: getCerts,
      uploadCert: uploadCert,
      deleteCert: deleteCert
    };
  }

}());
