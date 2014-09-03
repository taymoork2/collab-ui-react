'use strict';

angular.module('Core')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$window', '$http', '$routeParams', 'Storage', 'Config', 'Auth', 'Authinfo', 'PageParam',
    function($scope, $rootScope, $location, $window, $http, $routeParams, Storage, Config, Auth, Authinfo, PageParam) {

      var token = Storage.get('accessToken');
      var pageParam = $routeParams.pp;
      if (pageParam) {
        console.log('page param detected: ' + pageParam);
        PageParam.set(pageParam);
      }

      $scope.result = 'Loading...';
      $scope.isAuthorized = false;

      if (token) {
        $scope.result = 'Authorizing user...';
        Auth.authorize(token, $scope).then(function(){
          if($scope.isAuthorized){
            var path = 'home';
            if (PageParam.getRoute()) {
              path = PageParam.getRoute();
            }
            $location.url('/' + path);
            Config.tabs[path].active = 'true';
            $rootScope.services = Authinfo.getServices();
          }
        });
      } else {
        // Set oauth url depending on the environment
        var oauth2LoginUrl = Config.getOauthLoginUrl();
        console.log('No accessToken.');
        $window.location.href = oauth2LoginUrl;
      }

    }

  ]);
