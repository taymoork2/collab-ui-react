'use strict';

angular.module('Core')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$window', '$http', 'Storage', 'Config', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout',
    function($scope, $rootScope, $location, $window, $http, Storage, Config, Auth, Authinfo, PageParam, $state, $timeout) {

      var token = Storage.get('accessToken');
      var loadingDelay = 2000;
      var logoutDelay = 5000;

      var pageParam = $location.search().pp;
      if (pageParam) {
        console.log('page param detected: ' + pageParam);
        PageParam.set(pageParam);
      }

      var authorizeUser = function() {
        $scope.loading = true;
        token = Storage.get('accessToken');
        Auth.authorize(token, $scope).then(function(){
          var path = 'home';
          if (PageParam.getRoute()) {
            path = PageParam.getRoute();
          }

          if(Authinfo.getRoles().indexOf('PARTNER_ADMIN') > -1) {
            path = 'partnerhome';
          }
          $rootScope.services = Authinfo.getServices();

          $timeout(function(){
            $state.go(path);
          }, loadingDelay);
        }).catch(function(error){
          if (error) {
            $timeout(function(){
              $scope.result = error;
              $timeout(Auth.logout, logoutDelay);
            }, loadingDelay);
          } else {
            $timeout(Auth.logout, logoutDelay);
          }
        });
      };

      $scope.$on('ACCESS_TOKEN_REVIEVED', function() {
        authorizeUser();
      });

      if (token) {
        authorizeUser();
      }

      $scope.login = function() {
        Auth.redirectToLogin();
      };
    }
  ]);
