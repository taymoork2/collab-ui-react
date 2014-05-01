'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LoginCtrl', ['$scope', '$location', '$window', '$http', 'Storage', 'Config', 'Auth',
    function($scope, $location, $window, $http, Storage, Config, Auth) {

      var token = Storage.get('accessToken');
      $scope.result = 'Loading...';
      $scope.isAuthorized = false;

      // Set oauth url depending on the environment
      var oauth2LoginUrl = Config.getOauthLoginUrl();

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
