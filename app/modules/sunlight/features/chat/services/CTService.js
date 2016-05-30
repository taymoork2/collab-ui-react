(function () {
  'use strict';

  /* global Uint8Array:false */

  angular
    .module('Sunlight')
    .service('CTService', CTService);

  /* @ngInject */
  function CTService($http, Authinfo, BrandService) {
    var service = {
      getLogo: getLogo
    };
    return service;

    function getLogo() {
      return BrandService.getLogoUrl(Authinfo.getOrgId()).then(function (logoUrl) {
        return $http.get(logoUrl, {
          responseType: "arraybuffer"
        });
      });
    }
  }
})();
