(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronPlaceService($http, CsdmConverter, HuronConfig) {

    var cmiOtpUri = HuronConfig.getCmiUrl() + '/identity/machines/otp';

    function createOtp(machineUuid) {
      return $http.post(cmiOtpUri, {
        machineUuid: machineUuid
      }).then(function (res) {
        return CsdmConverter.convertCode({
          type: 'huron',
          activationCode: res.data.password,
          expiryTime: res.data.expiresOn,
          id: machineUuid
        });
      });
    }

    return {
      createOtp: createOtp
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronPlaceService', CsdmHuronPlaceService);

})();
