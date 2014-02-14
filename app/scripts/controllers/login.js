'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LoginCtrl', ['$scope', '$location', '$http', 'Storage',
    function($scope, $location, $http, Storage) {
      $scope.token = null;
      var token = Storage.get('accessToken');
      var authorizeUrl = 'http://171.68.20.197:8080/atlas-server/atlas/api/v1/authorize';
      $scope.oauth2LoginUrl = 'https://idbrokerbeta.webex.com/idb/oauth2/v1/authorize?response_type=token&client_id=C96d389d632c96d038d8f404c35904b5108988bd6d601d4b47f4eec88a569d5db&scope=webexsquare%3Aget_conversation&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&realm=1eb65fdf-9643-417f-9974-ad72cae0e10f&state=random-string';

      if (token) {
        $scope.token = true;
        $http.defaults.headers.common.Authorization = 'Bearer ' + token;
        $http.get(authorizeUrl)
          .success(function() {
            $location.path('/entitlement');
          })
          .error(function(data, status) {
            $scope.data = data || 'Authorization failed.';
            $scope.status = status;
          });
      } else {
        console.log('no token');
      }
    }
  ]);
