'use strict';

angular.module('Core')
  .controller('HeaderCtrl', ['$scope',
    function ($scope) {
      $scope.headerTitle = 'Cisco Collaboration Management';
      $scope.navStyle = 'admin';
    }
  ]);
