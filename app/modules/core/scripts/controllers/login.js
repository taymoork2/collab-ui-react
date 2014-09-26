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

      var authorizeUser = function() {
        $scope.result = 'Authorizing user...';
        token = Storage.get('accessToken');
        Auth.authorize(token, $scope).then(function(){
          if($scope.isAuthorized){
            var path = 'home';
            if (PageParam.getRoute()) {
              path = PageParam.getRoute();
            }

            $location.url('/' + path);
            //$window.location.href = urlPath + '/#/' + path;

            Config.tabs[path].active = 'true';
            $rootScope.services = Authinfo.getServices();
          }
        });
      };

      $scope.$on('ACCESS_TOKEN_REVIEVED', function() {
        authorizeUser();
      });

      if (token) {
        authorizeUser();
      } else {
        if ($rootScope.status && $rootScope.status !== 'loading')
        {
          // Set oauth url depending on the environment
          Auth.redirectToLogin();
        }
      }

    }

  ]);
