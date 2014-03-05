'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LoginCtrl', ['$scope', '$location', '$window', '$http', 'Storage', 'Config', 'Auth',
    function($scope, $location, $window, $http, Storage, Config, Auth) {

      var token = Storage.get('accessToken');
      $scope.result = 'Loading...';
      $scope.isAuthorized = false;

      // Set oauth url depending on the environment
      var oauth2LoginUrl = document.URL.indexOf('127.0.0.1') !== -1 || document.URL.indexOf('localhost') !== -1 ? Config.oauth2LoginUrlDev : Config.oauth2LoginUrlProd;

      if (token) {
        $scope.result = 'Authorizing user...';
        Auth.authorize(token, $scope).then(function(){
          if($scope.isAuthorized){
            $location.path('/users');
          }
        });
      } else {
        console.log('No accessToken.');
        $window.location.href = oauth2LoginUrl;
      }

    }

  ]);
