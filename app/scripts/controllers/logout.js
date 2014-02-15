'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LogoutCtrl', ['$scope', 'Storage',
    function($scope, Storage) {

      if(Storage.get('accessToken')){
        $scope.loggedIn = true;
      }else{
        $scope.loggedIn = false;
      }

      $scope.logout = function() {
        Storage.clear();
        $scope.loggedIn = false;
      };

    }
  ]);
