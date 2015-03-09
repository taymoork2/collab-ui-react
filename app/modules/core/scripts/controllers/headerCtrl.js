'use strict';

angular.module('Core')
  .controller('HeaderCtrl', ['$scope',
    function ($scope) {
      $scope.headerTitle = 'Spark Management';
      $scope.navStyle = 'admin';
      $scope.icon = '/images/sparkSm.png';
    }
  ]);
