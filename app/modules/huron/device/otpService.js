(function () {
  'use strict';

  angular
    .module('uc.device')
    .factory('OtpService', OtpService);

  /* @ngInject */
  function OtpService($rootScope, Authinfo, UserOTPService, HuronUser, HermesQRCodeService) {

    var service = {
      loadOtps: loadOtps,
      hyphenateOtp: hyphenateOtp,
      generateOtp: generateOtp,
      convertExpiryTime: convertExpiryTime,
      getQrCodeUrl: getQrCodeUrl
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
            if (otps[i].expires.status === "valid") {
              var otp = {
                code: otps[i].activationCode,
                friendlyCode: hyphenateOtp(otps[i].activationCode),
                expiresOn: otps[i].expires.time,
                friendlyExpiresOn: convertExpiryTime(otps[i].expires.time),
                valid: otps[i].expires.status
              };

              otpList.push(otp);
            }
          }
          return otpList;
        });
    }

    function generateOtp(userName) {
      var otp = {};
      return HuronUser.acquireOTP(userName).then(function (data) {
        otp = {
          code: data.password,
          friendlyCode: hyphenateOtp(data.password),
          expiresOn: data.expiresOn,
          friendlyExpiresOn: convertExpiryTime(data.expiresOn),
          valid: 'valid'
        };
        $rootScope.$broadcast("otpGenerated");
        return otp;
      });
    }

    function hyphenateOtp(otp) {
      if (otp) {
        return otp.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4");
      } else {
        return otp;
      }
    }

    function convertExpiryTime(expiryTime) {
      var timezone = jstz.determine().name();
      if (timezone === null || angular.isUndefined(timezone)) {
        timezone = 'UTC';
      }
      return (moment(expiryTime).local().tz(timezone).format('MMMM DD, YYYY h:mm A (z)'));
    }

    function getQrCodeUrl(activationCode) {
      return HermesQRCodeService.get({
        oneTimePassword: activationCode
      })
        .$promise;
    }

  }
})();
