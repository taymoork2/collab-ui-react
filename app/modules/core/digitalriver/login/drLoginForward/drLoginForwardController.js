(function () {
  'use strict';

  angular.module('Core')
    .controller('drLoginForwardController', drLoginForwardController);

  /* @ngInject */
  function drLoginForwardController($scope, $window, $cookies, $translate, Userservice) {

    var vm = this;

    Userservice.getUser('me',
      function (userData, status) {
        if (status != 200 || !userData.success) {
          $scope.error = userData.message;
        } else {

          Userservice.getUserAuthToken(userData.id)
            .catch(function (error) {
              vm.error = _.get(error, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
            })
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
