'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$window', '$http', 'Storage', 'Config', 'Auth', 'Authinfo',
    function($scope, $rootScope, $location, $window, $http, Storage, Config, Auth, Authinfo) {

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
            $rootScope.services = Authinfo.getServices();
          }
        });
      } else {
        console.log('No accessToken.');
        $window.location.href = oauth2LoginUrl;
      }

    }

  ]);
