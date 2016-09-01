(function () {
  'use strict';

  /* @ngInject  */
  function CsdmEmailService($http) {

    function sendCloudberryEmail(url, cbEmailInfo) {
      return $http.post(url, cbEmailInfo);
    }

    return {
      sendCloudberryEmail: sendCloudberryEmail
    };
  }

  angular
    .module('Squared')
    .service('CsdmEmailService', CsdmEmailService);

})();
