'use strict';

angular
  .module('Core')
  .controller('HeaderPushCtrl', ['$scope',
    function ($scope) {
      $scope.label = 'License Usage';
      $scope.state = 'license'; // Possible values are "license, warning, error"
    }
  ]);
