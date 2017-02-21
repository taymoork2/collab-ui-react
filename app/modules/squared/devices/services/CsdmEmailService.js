(function () {
  'use strict';

  /* @ngInject  */
  function CsdmEmailService($http, HuronConfig) {
    var url = HuronConfig.getEmailUrl() + '/email';

    function sendPersonalEmail(cbEmailInfo) {
      return $http.post(url + '/personalactivationcode/device', cbEmailInfo);
    }

    function sendPersonalCloudberryEmail(cbEmailInfo) {
      return $http.post(url + '/personalactivationcode/roomdevice', cbEmailInfo);
    }

    function sendCloudberryEmail(cbEmailInfo) {
      return $http.post(url + '/placeactivationcode/roomdevice', cbEmailInfo);
    }

    function sendHuronEmail(cbEmailInfo) {
      return $http.post(url + '/placeactivationcode/deskphone', cbEmailInfo);
    }

    return {
      sendPersonalEmail: sendPersonalEmail,
      sendPersonalCloudberryEmail: sendPersonalCloudberryEmail,
      sendCloudberryEmail: sendCloudberryEmail,
      sendHuronEmail: sendHuronEmail,
    };
  }

  angular
    .module('Squared')
    .service('CsdmEmailService', CsdmEmailService);

})();
