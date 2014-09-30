'use strict';

angular.module('Core')
  .controller('AccountReviewCtrl', ['$scope', '$location', 'Storage', 'Auth', 'Log',
    function($scope, $location, Storage, Auth, Log) {

			//Populating authinfo data if empty.
      var token = Storage.get('accessToken');
      if (Auth.isAuthorizedFtwPath($scope)) {
        Log.debug('Authinfo data is loaded.');
      }

      $scope.nextStep = function() {
        $location.path('/initialsetup/adduser');
      };
    }
  ]);
