(function () {
  'use strict';

  angular.module('Core')
    .controller('drLoginForwardController', drLoginForwardController);

  /* @ngInject */
  function drLoginForwardController($window, $cookies, $translate, DigitalRiverService, Userservice) {

    Userservice.getUser('me',
      function (userData, status) {
        if (status == 200 || userData.success) {
          DigitalRiverService.getUserAuthToken(userData.id)
            .then(function (result) {
              $cookies.atlasDrCookie = _.get(result, 'data.data.token');
              if ($cookies.atlasDrCookie) {
                $window.location.href = "http://www.digitalriver.com/";
              }
            });
        }

      });
  }
})();
