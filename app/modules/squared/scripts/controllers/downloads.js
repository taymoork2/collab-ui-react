(function () {
  'use strict';

  angular.module('Squared')
    .controller('DownloadsCtrl', DownloadsCtrl);

  /* @ngInject */
  function DownloadsCtrl($scope, $location, $http, Localytics, UrlConfig, Userservice) {
    // Note: only keep Localytics until we gathered enough data usage
    Localytics.tagEvent('Display /downloads', {
      hasJustResetPassword: !!$location.search().pwdResetSuccess
    });
    $scope.email = $location.search().email;
    $scope.tlData = {
      email: $scope.email
    };

    $scope.webClientURL = UrlConfig.getWebClientUrl();
    $scope.iPhoneURL = UrlConfig.getItunesStoreUrl();
    $scope.androidURL = UrlConfig.getAndroidStoreUrl();

    var hasJustResetPassword = $location.search().pwdResetSuccess;

    if (hasJustResetPassword) {
      // call backend to send

      var callback = function (data, status) {
        if (data.success) {
          $scope.sendStatus = 'email success';
        } else {
          $scope.sendStatus = 'email failed status: ' + status;
        }
      };

      Userservice.sendEmail($scope.email, $location.search().forward, callback);
    }

  }
})();
