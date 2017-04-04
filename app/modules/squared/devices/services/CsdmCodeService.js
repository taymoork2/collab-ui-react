(function () {
  'use strict';

  /* @ngInject  */
  function CsdmCodeService($http, Authinfo, UrlConfig, CsdmConverter) {

    var codesUrl = UrlConfig.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/codes';

    function createCodeForExisting(cisUuid) {
      return $http.post(codesUrl, {
        cisUuid: cisUuid,
      }).then(function (res) {
        return CsdmConverter.convertCode(res.data);
      });
    }

    return {
      createCodeForExisting: createCodeForExisting,
    };
  }

  angular
    .module('Squared')
    .service('CsdmCodeService', CsdmCodeService);

})();
