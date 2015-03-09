'use strict';

angular
  .module('Core')
  .controller('HeaderPushCtrl', ['$scope',
    function ($scope) {
      $scope.label = 'License Usage';
      $scope.state = 'normal';
      $scope.icon = 'icon-star';
    }
  ]);
