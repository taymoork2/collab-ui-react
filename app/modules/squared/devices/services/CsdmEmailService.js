(function () {
  'use strict';

  /* @ngInject  */
  function CsdmEmailService($http, HuronConfig) {
    var url = HuronConfig.getEmailUrl() + '/email/placeactivationcode/';

    function sendCloudberryEmail(cbEmailInfo) {
      return $http.post(url + 'collaborationdevice', cbEmailInfo);
    }

    function sendHuronEmail(cbEmailInfo) {
      return $http.post(url + 'deskphone', cbEmailInfo);
    }

    return {
      sendCloudberryEmail: sendCloudberryEmail,
      sendHuronEmail: sendHuronEmail
    };
  }

  angular
    .module('Squared')
    .service('CsdmEmailService', CsdmEmailService);

})();
