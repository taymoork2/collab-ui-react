(function () {
  'use strict';

  angular
    .module('uc.device')
    .factory('OtpService', OtpService);

  /* @ngInject */
  function OtpService($rootScope, HuronUser) {

    var service = {
      hyphenateOtp: hyphenateOtp,
      generateOtp: generateOtp,
      convertExpiryTime: convertExpiryTime
    };

    return service;
    /////////////////////

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
        return _.replace(otp, /(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4");
      } else {
        return otp;
      }
    }

    function convertExpiryTime(expiryTime) {
      var timezone = jstz.determine().name();
      if (timezone === null || _.isUndefined(timezone)) {
        timezone = 'UTC';
      }
      return (moment(expiryTime).local().tz(timezone).format('MMMM DD, YYYY h:mm A (z)'));
    }

  }
})();
