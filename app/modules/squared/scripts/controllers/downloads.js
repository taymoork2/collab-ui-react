'use strict';

angular.module('Squared')
  .controller('DownloadsCtrl', ['$scope', '$location', '$http', 'Config', 'Userservice',
    function ($scope, $location, $http, Config, Userservice) {

      $scope.email = $location.search().email;
      $scope.tlData = {
        email: $scope.email
      };

      $scope.webClientURL = Config.getWebClientUrl();
      $scope.iPhoneURL = Config.getItunesStoreUrl();
      $scope.androidURL = Config.getAndroidStoreUrl();

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
  ]);
