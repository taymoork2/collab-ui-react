'use strict';

angular
  .module('Core')
  .controller('HeaderPushCtrl', ['$scope', '$filter',
    function ($scope, $filter) {
      $scope.label = $filter('translate')('leaderBoard.licenseUsage');
      $scope.state = 'license'; // Possible values are license, warning or error
    }
  ]);
