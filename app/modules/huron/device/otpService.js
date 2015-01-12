(function () {
  'use strict';

  angular
    .module('uc.device')
    .factory('OtpService', OtpService);

  /* @ngInject */
  function OtpService(Authinfo, UserOTPService) {
    var service = {
      loadOtps: loadOtps,
      hyphenateOtp: hyphenateOtp
    };

    return service;
    /////////////////////

    function loadOtps(userUuid) {
      return UserOTPService.query({
          customerId: Authinfo.getOrgId(),
          userId: userUuid
        }).$promise
        .then(function (otps) {
          var otpList = [];
          for (var i = 0; i < otps.length; i++) {
            var otp = {
              code: otps[i].activationCode,
              friendlyCode: hyphenateOtp(otps[i].activationCode),
              expiresOn: otps[i].expires.time,
              friendlyExpiresOn: convertExpiryTime(otps[i].expires.time, 'America/Los_Angeles'),
              valid: otps[i].expires.valid
            };

            otpList.push(otp);
          }
          return otpList;
        });
    }

    function hyphenateOtp(otp) {
      if (otp) {
        return otp.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4");
      } else {
        return otp;
      }
    }

    function convertExpiryTime(expiryTime, timezone) {
      return moment.tz(expiryTime, timezone).format('MM/DD/YY h:mmA');
    }

  }

})();
